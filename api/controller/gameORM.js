import prisma from '../database/databaseORM.js'
import fs from 'fs'

/**
 * @swagger
 * /game:
 *   get:
 *     summary: Get all games
 *     description: Retrieve a list of all games with basic information
 *     tags:
 *       - Game
 *     responses:
 *       200:
 *         description: List of games retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameList'
 *       500:
 *         description: Server error
 */
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
                grid_id: true,
                banner_id: true,
                is_approved: true,
            },
        });
        res.send(games);
    } catch (err) {

        res.sendStatus(500);
    }
}

/**
 * @swagger
 * /game/{id}:
 *   get:
 *     summary: Get game details by ID
 *     description: Retrieve comprehensive game information including description, photos, tags, and linked events
 *     tags:
 *       - Game
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameDetail'
 *       404:
 *         description: Game not found
 *       500:
 *         description: Server error
 */
export const getGameById = async (req, res) => {
    try {
        const { id } = req.gameParamsVal;
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
                studio: true,
                publisher: true,
                event_game: {
                    include: {
                        event: true
                    }
                },
                game_tag: {
                    include: {
                        tag: true
                    }
                }
            },
        });
        if (game) {
            res.send(game);
        } else {
            res.sendStatus(404);
        }
    } catch (err) {

        res.sendStatus(500);
    }
}

/**
 * @swagger
 * /game/with-photos:
 *   post:
 *     summary: Create a new game with photos
 *     description: Create a game entry with banner, logo, and grid images in a single transaction
 *     tags:
 *       - Game
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - studio
 *               - publisher
 *               - release_date
 *               - platforms
 *               - banner
 *               - logo
 *               - grid
 *             properties:
 *               name:
 *                 type: string
 *               studio:
 *                 type: string
 *               publisher:
 *                 type: string
 *               release_date:
 *                 type: string
 *                 format: date-time
 *               platforms:
 *                 type: string
 *                 description: Comma-separated platform list
 *               description:
 *                 type: string
 *               is_approved:
 *                 type: boolean
 *               banner:
 *                 type: string
 *                 format: binary
 *               logo:
 *                 type: string
 *                 format: binary
 *               grid:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Game created successfully with photos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameDetail'
 *       400:
 *         description: Missing required fields or invalid data
 *       500:
 *         description: Server error
 */
export const addGameWithPhotos = async (req, res) => {
    try {
        // Vérifier que les 3 fichiers sont présents
        if (!req.files?.banner || !req.files?.logo || !req.files?.grid) {
            return res.status(400).json({ message: 'Les 3 images (banner, logo, grid) sont requises' })
        };

        const { name, studio, publisher, release_date, description, platforms, is_approved } = req.body;

        // Valider les champs requis
        if (!name || !studio || !publisher || !release_date || !platforms) {
            return res.status(400).json({ message: 'Les champs requis sont manquants' });
        }

        // Formater les platformes
        const formatted_platforms = typeof platforms === 'string'
            ? platforms.split(',').map(p => p.trim()).join(', ')
            : Array.isArray(platforms)
                ? platforms.join(', ')
                : platforms;

        // Si l'utilsateur n'est pas admin, is_approved doit être false
        if (!req.user.is_admin) {
            is_approved = false;
        }

        // Transaction : créer photos + jeu ensemble
        const result = await prisma.$transaction(async (tx) => {
            // 1. Créer les 3 photos
            const bannerPhoto = await tx.photo.create({
                data: { url: req.files.banner[0].filename }
            });
            const logoPhoto = await tx.photo.create({
                data: { url: req.files.logo[0].filename }
            });
            const gridPhoto = await tx.photo.create({
                data: { url: req.files.grid[0].filename }
            });

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
            });

            return game;
        });

        res.status(201).json({
            message: 'Jeu créé avec les images',
            game: result
        });

    } catch (err) {
        res.status(500).json({ error: err.message || 'Erreur lors de la création du jeu' });
    }
}

// Add a new game without photos
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
            is_approved,
            studio,
            publisher
        } = req.val;

        // Si l'utilsateur n'est pas admin, is_approved doit être false
        if (!req.user.is_admin) {
            is_approved = false;
        }

        //Platforms Should just be a string. Join them with commas.
        const formatted_platforms = platforms.join(', ');
        const { id } = await prisma.game.create({
            data: {
                name,
                platforms: formatted_platforms,
                release_date,
                description,
                banner_id,
                logo_id,
                grid_id,
                is_approved,
                studio,
                publisher
            },
            select: {
                id: true
            }
        });
        res.status(201).send({ id });
    } catch (err) {

        res.sendStatus(500);
    }
}

/**
 * @swagger
 * /game/{id}:
 *   patch:
 *     summary: Update game information
 *     description: Update game details including metadata and photo IDs (admin only)
 *     tags:
 *       - Game
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               studio:
 *                 type: string
 *               publisher:
 *                 type: string
 *               description:
 *                 type: string
 *               release_date:
 *                 type: string
 *                 format: date-time
 *               platforms:
 *                 type: array
 *                 items:
 *                   type: string
 *               banner_id:
 *                 type: integer
 *               logo_id:
 *                 type: integer
 *               grid_id:
 *                 type: integer
 *               is_approved:
 *                 type: boolean
 *     responses:
 *       204:
 *         description: Game updated successfully
 *       403:
 *         description: Unauthorized - admin access required
 *       404:
 *         description: Game not found
 *       500:
 *         description: Server error
 */
export const updateGame = async (req, res) => {
    try {
        const { id } = req.gameParamsVal;

        const existing = await prisma.game.findUnique({ where: { id: id } });

        if (!existing) return res.sendStatus(404);
        if (!req.user.is_admin) {
            return res.status(403).send({ message: "Accès refusé" });
        }
        const updateData = { ...req.body };

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

        res.sendStatus(500);
    }
}

/**
 * @swagger
 * /game/{id}:
 *   delete:
 *     summary: Delete a game
 *     description: Delete a game and all associated photos (admin only)
 *     tags:
 *       - Game
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *     responses:
 *       204:
 *         description: Game deleted successfully
 *       403:
 *         description: Unauthorized - admin access required
 *       404:
 *         description: Game not found
 *       500:
 *         description: Server error
 */
export const deleteGame = async (req, res) => {
    try {
        const { id } = req.gameParamsVal;

        const existing = await prisma.game.findUnique({ where: { id: id } });

        if (!existing) return res.sendStatus(404);
        if (!req.user.is_admin)
            return res.status(403).send({ message: "Accès refusé" });

        const game = await prisma.game.findUnique({ where: { id } });

        // supprimer les photos associées (fichiers + entrées DB)
        const photoIds = [game.banner_id, game.logo_id, game.grid_id].filter(Boolean);
        for (const photoId of photoIds) {
            try {
                const photo = await prisma.photo.findUnique({ where: { id: photoId } });
                if (photo?.url) {
                    fs.unlink(`./uploads/${photo.url}`, () => { });
                }
                await prisma.photo.delete({ where: { id: photoId } });
            } catch (cleanupErr) {
                console.error('Erreur suppression photo associée', cleanupErr);
            }
        }
        await prisma.game.delete({ where: { id } });

        res.sendStatus(204);
    } catch (e) {

        res.sendStatus(500);
    }

}
