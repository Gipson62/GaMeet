import prisma from '../database/databaseORM.js'
import fs from 'fs'

export const getAllGames = async (req, res) => {
    try {
        // Need to get: game_id, name, platformes, release_date, logo_id, studio, approval status, publisher
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
        const  {id}  = req.gameParamsVal;
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
        const {id} = await prisma.game.create({
            data: {
                name,
                platforms,
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

        if (updateData.banner_id) {
            await prisma.photo.delete({
                where: { id: game.banner_id }
            });
        }
        if (updateData.logo_id) {
            await prisma.photo.delete({
                where: { id: game.logo_id }
            });
        }
        if (updateData.grid_id) {
            await prisma.photo.delete({
                where: { id: game.grid_id }
            });
        }

        await prisma.game.update({
            where: { id },
            data: updateData
        });

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
