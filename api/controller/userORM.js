import prisma from '../database/databaseORM.js'
import { hash, compare } from '../util/index.js'
import  { sign } from '../util/jwt.js'
import fs from "fs";

const DEFAULT_AVATAR_URL = "default-avatar.png";

export const getUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id : req.val.id
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
        console.error(e)
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
        console.error(err);
        res.sendStatus(500);
    }
};

export const addUser = async (req, res) => {
    try {
        const { pseudo, email, password, birth_date, bio} = req.val

        // Vérifie si l’email existe déjà
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            if (req.file?.filename) fs.unlink(`./uploads/${req.file.filename}`, () => {
            });
            return res.status(409).send({message: 'Email déjà utilisé'})
        }

        // Avatar par défaut
        const defaultPhoto = await prisma.photo.findFirst({
            where: { url: DEFAULT_AVATAR_URL },
            select: { id: true },
        });
        if (!defaultPhoto) {
            if (req.file?.filename) fs.unlink(`./uploads/${req.file.filename}`, () => {});
            return res.status(500).json({ message: "Photo par défaut manquante" });
        }

        // transaction: si avatar => créer photo + user, sinon juste user
        const created = await prisma.$transaction(async (tx) => {
            let photoId = defaultPhoto.id;

            if (req.file?.filename) {
                const photo = await tx.photo.create({
                    data: { url: req.file.filename },
                    select: { id: true },
                });
                photoId = photo.id;
            }

            const user = await tx.user.create({
                data: {
                    pseudo: pseudo,
                    email: email,
                    password: await hash(password),
                    birth_date: new Date(birth_date),
                    bio: bio,
                    is_admin: false,
                    photo_id: photoId,
                },
                select: { id: true },
            });
            return user;
        });

        res.status(201).send(created);
    } catch (e) {
        console.error(e);
        // si upload a eu lieu et qu'on crash => on supprime le fichier uploadé
        if (req.file?.filename) fs.unlink(`./uploads/${req.file.filename}`, () => {});
        res.sendStatus(500);
    }
}

export const updateUser = async (req, res) => {
    try {
        const {id, pseudo, birth_date, bio, email, photo_id } = req.val;
        await prisma.user.update({
            data: {
                pseudo,
                birth_date,
                bio,
                email,
                photo_id
            },
            where: {
                id
            }
        })
        res.sendStatus(204)
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }
}

export const deleteUser = async (req, res) => {
    try {
        const {id} = req.val;
        await prisma.$transaction([
            prisma.review.deleteMany({
                where: { user_id: id }
            }),
            prisma.participant.deleteMany({
                where: { user_id: id }
            }),
            prisma.user.delete({
                where: { id }
            })
        ]);

        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
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
                is_admin: user.is_admin
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
        console.error(err)
        res.sendStatus(500)
    }
}
export const updateUserAvatar = async (req, res) => {
    try {
        const userId = req.val;

        // Sécurité : soit admin, soit propriétaire
        if (!req.user.is_admin && req.user.id !== userId) {
            return res.status(403).json({ message: "Accès refusé" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                photo: {
                    select: { id : true, url: true }
                }
            }
        });

        if (!user) return res.sendStatus(404);

        const { filename } = req.file;

        // créer la nouvelle photo
        const newPhoto = await prisma.photo.create({
            data: { url: filename }
        });

        // mettre à jour l'utilisateur
        await prisma.user.update({
            where: { id: userId },
            data: { photo_id: newPhoto.id }
        });

        if (user.photo && user.photo.url !== DEFAULT_AVATAR_URL) {
            const oldPhoto = await prisma.photo.findUnique({
                where: { id: user.photo_id }
            });

            if (oldPhoto) {
                await prisma.photo.delete({ where: { id: oldPhoto.id } });
            }
        }

        res.status(200).json({ photo_id: newPhoto.id });
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
};


