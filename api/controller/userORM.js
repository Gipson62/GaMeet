import prisma from '../database/databaseORM.js'
import { hash, compare } from '../util/index.js'
import { sign } from '../util/jwt.js'
import fs from "fs";

const DEFAULT_AVATAR_URL = "default_pfp.jpg";


const safeUnlink = (filename) => {
    if (!filename) return;
    fs.unlink(`./uploads/${filename}`, () => { });
};

export const getUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.val.id
            },
            select: {
                id: true,
                pseudo: true,
                email: true,
                is_admin: true,
                bio: true,
                birth_date: true,
                creation_date: true,

                photo: true,

                event: {
                    select: {
                        id: true,
                        name: true,
                        scheduled_date: true,
                        location: true,
                    },
                },

                participant: {
                    select: {
                        event: {
                            select: {
                                id: true,
                                name: true,
                                scheduled_date: true,
                                location: true,
                            },
                        },
                    },
                },

                review: {
                    select: {
                        id: true,
                        note: true,
                        description: true,
                        created_at: true,
                        event: { select: { id: true, name: true } },
                    },
                    orderBy: { created_at: "desc" },
                },
            },
        });
        if (user) {
            res.send(user)
        } else {
            res.sendStatus(404)
        }
    } catch (e) {
        res.sendStatus(500)
    }
}
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                pseudo: true,
                email: true,
                is_admin: true,
                birth_date: true,
                bio: true,
                creation_date: true,

                photo: true,
                event: true,
                participant: true,
                review: true
            }
        });

        res.send(users);
    } catch (err) {

        res.sendStatus(500);
    }
};

export const addUser = async (req, res) => {
    try {
        const { pseudo, email, password, birth_date, bio } = req.val

        // Vérifie si l’email existe déjà
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            if (req.file?.filename) fs.unlink(`./uploads/${req.file.filename}`, () => {
            });
            return res.status(409).send({ message: 'Email déjà utilisé' })
        }

        // Avatar par défaut
        const defaultPhoto = await prisma.photo.findFirst({
            where: { url: DEFAULT_AVATAR_URL },
            select: { id: true },
        });

        // transaction: si avatar => créer photo + user, sinon juste user
        const created = await prisma.$transaction(async (tx) => {
            let photoId = defaultPhoto?.id; // Peut être undefined si pas de photo par défaut

            if (req.file?.filename) {
                const photo = await tx.photo.create({
                    data: { url: req.file.filename },
                    select: { id: true },
                });
                photoId = photo.id;
            }

            return tx.user.create({
                data: {
                    pseudo: pseudo,
                    email: email,
                    password: await hash(password),
                    birth_date: new Date(birth_date),
                    bio: bio,
                    is_admin: false,
                    photo_id: photoId, // Peut être null si photoId est undefined
                },
                select: { id: true },
            });
        });

        res.status(201).send(created);
    } catch (e) {

        // si upload a eu lieu et qu'on crash => on supprime le fichier uploadé
        if (req.file?.filename) fs.unlink(`./uploads/${req.file.filename}`, () => { });
        res.sendStatus(500);
    }
}

export const updateUser = async (req, res) => {
    const uploadedFilename = req.file?.filename;
    const cleanupUpload = () => safeUnlink(uploadedFilename);

    try {
        const { pseudo, birth_date, bio, email } = req.val;
        // id provient du paramètre si admin, sinon du token utilisateur
        const targetId = req.params?.id ? parseInt(req.params.id, 10) : req.user?.id;

        if (!req.user) {
            cleanupUpload();
            return res.status(401).json({ message: "Non authentifié" });
        }

        if (!targetId || Number.isNaN(targetId)) {
            cleanupUpload();
            return res.status(400).json({ message: "Identifiant utilisateur manquant" });
        }

        const isSelfUpdate = req.user.id === targetId;

        if (!req.user.is_admin && !isSelfUpdate) {
            cleanupUpload();
            return res.status(403).json({ message: "Accès refusé" });
        }

        const target = await prisma.user.findUnique({
            where: { id: targetId },
            select: { is_admin: true, photo: { select: { id: true, url: true } } },
        });

        if (!target) {
            cleanupUpload();
            return res.sendStatus(404);
        }

        // admin ne modifie pas un autre admin
        if (target.is_admin && !isSelfUpdate) {
            cleanupUpload();
            return res.status(403).json({ message: "Impossible de modifier un autre administrateur" });
        }

        const oldPhotoId = target.photo?.id ?? null;
        const oldPhotoUrl = target.photo?.url ?? null;

        let newPhotoId = oldPhotoId;

        if (uploadedFilename) {
            const newPhoto = await prisma.photo.create({
                data: { url: uploadedFilename },
                select: { id: true },
            });
            newPhotoId = newPhoto.id;
        }

        await prisma.user.update({
            where: { id: targetId },
            data: {
                pseudo,
                email,
                birth_date: birth_date ? new Date(birth_date) : undefined,
                bio,
                photo_id: newPhotoId,
            },
        });

        // Supprime l’ancienne photo si elle est remplacée, non par défaut et plus utilisée
        if (uploadedFilename && oldPhotoId && oldPhotoUrl !== DEFAULT_AVATAR_URL) {
            const stillUsed = await prisma.user.count({ where: { photo_id: oldPhotoId } });
            if (stillUsed === 0) {
                await prisma.photo.delete({ where: { id: oldPhotoId } });
                safeUnlink(oldPhotoUrl);
            }
        }

        return res.sendStatus(204);
    } catch (e) {

        cleanupUpload();
        return res.sendStatus(500);
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.val;

        if (!req.user?.is_admin) {
            return res.status(403).json({ message: "Accès refusé" });
        }

        const target = await prisma.user.findUnique({
            where: { id },
            select: {
                is_admin: true,
                photo: { select: { id: true, url: true } },
            },
        });

        if (!target) return res.sendStatus(404);

        // admin peut se supprimer lui-même, pas un autre admin
        if (target.is_admin && req.user.id !== id) {
            return res
                .status(403)
                .json({ message: "Impossible de supprimer un autre administrateur" });
        }

        // On garde les infos photo pour suppression après
        const photoId = target.photo?.id ?? null;
        const photoUrl = target.photo?.url ?? null;

        await prisma.$transaction(async (tx) => {
            await tx.review.deleteMany({ where: { user_id: id } });
            await tx.participant.deleteMany({ where: { user_id: id } });

            await tx.user.delete({ where: { id } });

            // supprimer photo seulement si elle existe et n'est pas la photo par défaut
            if (photoId && photoUrl !== DEFAULT_AVATAR_URL) {
                const stillUsed = await tx.user.count({
                    where: { photo_id: photoId },
                });

                if (stillUsed === 0) {
                    await tx.photo.delete({ where: { id: photoId } });
                }
            }
        });

        // supprimer le fichier (après commit)
        if (photoUrl && photoUrl !== DEFAULT_AVATAR_URL) {
            safeUnlink(photoUrl);
        }

        return res.sendStatus(204);
    } catch (err) {

        return res.sendStatus(500);
    }
};


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.val

        // Récupère l’utilisateur par email
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) return res.status(404).send({ message: 'Utilisateur introuvable' })

        // Vérifier mdp
        const valid = await compare(password, user.password)
        if (!valid) return res.status(401).send({ message: 'Mot de passe incorrect' })

        // Création du token JWT
        const token = sign(
            {
                id: user.id,
                email: user.email,
                //is_admin: user.is_admin
            },
            { expiresIn: '2h' }
        )

        res.send({
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                pseudo: user.pseudo,
                email: user.email,
                is_admin: user.is_admin
            }
        })
    } catch (err) {
        console.error(err); // Log l'erreur pour le debug
        res.sendStatus(500)
    }
}
