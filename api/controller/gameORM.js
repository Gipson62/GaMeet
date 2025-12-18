import prisma from '../database/databaseORM.js'
import fs from 'fs'

export const getAllGames = async (req, res) => {
    try {
        // Need to get: game_id, name, platforms, release_date, logo_id, studio, approval status, publisher
        const games = await prisma.game.findMany({
            select: {
                id: true,
                name: true,
                platforms: true,
                release_date: true,
                studio: true,
                publisher: true,
                logo_id: true,
                is_approved: true,
            },
        });
        res.send(games);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}

export const getGameById = async (req, res) => {
    try {
        const  {id} = req.gameParamsVal;
        const game = await prisma.game.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                platforms: true,
                release_date: true,
                description: true,
                banner_id: true,
                logo_id: true,
                grid_id: true,
                is_approved: true,
            },
        });
        if (game) {
            res.send(game);
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}

export const addGameWithPhotos = async (req, res) => {
    try {
        // Vérifier que les 3 fichiers sont présents
        if (!req.files?.banner || !req.files?.logo || !req.files?.grid) {
            return res.status(400).json({ message: 'Les 3 images (banner, logo, grid) sont requises' })
        }

        const { name, studio, publisher, release_date, description, platforms, is_approved } = req.body

        // Valider les champs requis
        if (!name || !studio || !publisher || !release_date || !platforms) {
            return res.status(400).json({ message: 'Les champs requis sont manquants' })
        }

        // Formater les platformes
        const formatted_platforms = typeof platforms === 'string'
            ? platforms.split(',').map(p => p.trim()).join(', ')
            : Array.isArray(platforms)
            ? platforms.join(', ')
            : platforms

        // Transaction : créer photos + jeu ensemble
        const result = await prisma.$transaction(async (tx) => {
            // 1. Créer les 3 photos
            const bannerPhoto = await tx.photo.create({
                data: { url: req.files.banner[0].filename }
            })
            const logoPhoto = await tx.photo.create({
                data: { url: req.files.logo[0].filename }
            })
            const gridPhoto = await tx.photo.create({
                data: { url: req.files.grid[0].filename }
            })

            // 2. Créer le jeu avec les IDs des photos
            const game = await tx.game.create({
                data: {
                    name,
                    studio,
                    publisher,
                    release_date: new Date(release_date),
                    description: description || null,
                    platforms: formatted_platforms,
                    is_approved: is_approved === 'true' || is_approved === true || false,
                    banner_id: bannerPhoto.id,
                    logo_id: logoPhoto.id,
                    grid_id: gridPhoto.id,
                },
                select: { id: true, name: true }
            })

            return game
        })

        res.status(201).json({
            message: 'Jeu créé avec les images',
            game: result
        })

    } catch (err) {
        console.error('Erreur addGameNew:', err)
        res.status(500).json({ error: err.message || 'Erreur lors de la création du jeu' })
    }
}

//TODO: add photos handling
export const addGame = async (req, res) => {
    try {
        const {
            name,
            platforms,
            release_date,
            description,
            banner_id,
            logo_id,
            grid_id,
            is_approved
        } = req.val;
        //Platforms Should just be a string. Join them with commas.
        const formatted_platforms = platforms.join(', ');
        const {id} = await prisma.game.create({
            data: {
                name,
                platforms: formatted_platforms,
                release_date,
                description,
                banner_id,
                logo_id,
                grid_id,
                is_approved
            },
            select: {
                id: true
            }
        });
        res.status(201).send({id});
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}

//TODO: add photos handling
export const updateGame = async (req, res) => {
    try {
        const { id } = req.gameParamsVal;

        const existing = await prisma.event.findUnique({ where: { id: id } });

        if (!existing) return res.sendStatus(404);
        if (!req.user.is_admin) {
            return res.status(403).send({message: "Accès refusé"});
        }
        const updateData  = {...req.body};

        delete updateData.id;
        delete updateData.author;

        if (updateData.release_date) {
            updateData.release_date = new Date(updateData.release_date);
        }
        let game = await prisma.game.findUnique({ where: { id: id } });

        // Store old photo IDs before updating
        const oldBannerId = updateData.banner_id && updateData.banner_id !== game.banner_id ? game.banner_id : null;
        const oldLogoId = updateData.logo_id && updateData.logo_id !== game.logo_id ? game.logo_id : null;
        const oldGridId = updateData.grid_id && updateData.grid_id !== game.grid_id ? game.grid_id : null;

        if (updateData.platforms && Array.isArray(updateData.platforms)) {
            updateData.platforms = updateData.platforms.join(', ');
        }

        // Update the game first
        await prisma.game.update({
            where: { id },
            data: updateData
        });

        // Then delete old photos (after they're no longer referenced)
        if (oldBannerId) {
            await prisma.photo.delete({
                where: { id: oldBannerId }
            });
        }
        if (oldLogoId) {
            await prisma.photo.delete({
                where: { id: oldLogoId }
            });
        }
        if (oldGridId) {
            await prisma.photo.delete({
                where: { id: oldGridId }
            });
        }

        res.sendStatus(204);

    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}

export const deleteGame = async (req, res) => {
    try {
        const { id } = req.gameParamsVal

        const existing = await prisma.game.findUnique({ where: { id: id } })

        if (!existing) return res.sendStatus(404)
        if (!req.user.is_admin)
            return res.status(403).send({ message: "Accès refusé" })

        await prisma.game.delete({ where: { id } })

        res.sendStatus(204)
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }

}

/*
 * Met à jour une photo (banner|logo|grid) d'un jeu :
 * - upload d'un nouveau fichier
 * - suppression de l'ancienne photo (DB + fichier)
 * - mise à jour du champ sur le jeu
 */
export const updateGamePhoto = async (req, res) => {
    try {
        const { id, type } = req.params

        if (!req.user?.is_admin) {
            return res.status(403).json({ message: 'Accès refusé' })
        }

        if (!['banner', 'logo', 'grid'].includes(type)) {
            return res.status(400).json({ message: 'Type de photo invalide' })
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier reçu' })
        }

        const numericId = Number(id)
        const game = await prisma.game.findUnique({ where: { id: numericId } })
        if (!game) return res.sendStatus(404)

        const fieldMap = {
            banner: 'banner_id',
            logo: 'logo_id',
            grid: 'grid_id'
        }
        const field = fieldMap[type]

        // créer la nouvelle photo
        const newPhoto = await prisma.photo.create({ data: { url: req.file.filename } })

        // garder l'ancien id pour suppression
        const oldPhotoId = game[field]

        // mettre à jour le jeu
        await prisma.game.update({
            where: { id: numericId },
            data: { [field]: newPhoto.id }
        })

        // supprimer l'ancienne photo (fichier + DB) si existante
        if (oldPhotoId) {
            try {
                const oldPhoto = await prisma.photo.findUnique({ where: { id: oldPhotoId } })
                if (oldPhoto?.url) {
                    fs.unlink(`./uploads/${oldPhoto.url}`, () => {})
                }
                await prisma.photo.delete({ where: { id: oldPhotoId } })
            } catch (cleanupErr) {
                console.error('Erreur suppression ancienne photo', cleanupErr)
            }
        }

        return res.status(200).json({
            message: 'Photo mise à jour',
            field,
            photoId: newPhoto.id,
            url: newPhoto.url
        })

    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
}
