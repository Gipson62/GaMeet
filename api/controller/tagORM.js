import prisma from '../database/databaseORM.js'

/**
 * @swagger
 * /tag:
 *   get:
 *     summary: Get all tags
 *     description: Retrieve a complete list of all available tags in the system
 *     tags:
 *       - Tag
 *     responses:
 *       200:
 *         description: List of tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 *       500:
 *         description: Server error
 */
export const getAllTags = async (req, res) => {
    try {
        const games = await prisma.tag.findMany({
            select: {
                name: true
            },
        });
        res.send(games);
    } catch (err) {

        res.sendStatus(500);
    }
}

/**
 * @swagger
 * /tag/game/{id}:
 *   get:
 *     summary: Get all tags for a game
 *     description: Retrieve all tags associated with a specific game
 *     tags:
 *       - Tag
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tag_name:
 *                     type: string
 *       500:
 *         description: Server error
 */
export const getAllTagFromGameId = async (req, res) => {
    try {
        const { id } = req.gameParamsVal
        const tags = await prisma.game_tag.findMany({
            where: { game_id: id },
            select: {
                tag: {
                    select: {
                        name: true
                    }
                }
            }
        })
        res.send(tags.map(t => ({ tag_name: t.tag.name })))
    } catch (err) {
        res.sendStatus(500)
    }
}

/*
 * Associe un tag à un jeu, crée le tag s'il n'existe pas
 */

/**
 * @swagger
 * /tag/game/{id}:
 *   post:
 *     summary: Add a tag to a game
 *     description: Associate a tag with a game. Creates the tag if it doesn't exist.
 *     tags:
 *       - Tag
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
 *             required:
 *               - tag_name
 *             properties:
 *               tag_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tag added to game successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
export const addTagFromGameId = async (req, res) => {
    try {
        const { id, tag_name } = req.gameIdTagNameParam;


        let tag = await prisma.tag.findUnique({ where: { name: tag_name } })
        if (!tag) {
            tag = await prisma.tag.create({ data: { name: tag_name }, select: { name: true } })
        }

        await prisma.game_tag.create({
            data: {
                game_id: id,
                tag_name: tag.name
            },
            select: {
                tag_name: true
            }
        })

        res.status(201).send({ message: "Tag ajouté au jeu" })
    } catch (err) {
        res.sendStatus(500)
    }
}

/**
 * @swagger
 * /tag/game/{id}:
 *   delete:
 *     summary: Remove a tag from a game
 *     description: Disassociate a tag from a game by ID
 *     tags:
 *       - Tag
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
 *             required:
 *               - tag_name
 *             properties:
 *               tag_name:
 *                 type: string
 *     responses:
 *       204:
 *         description: Tag removed from game successfully
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Server error
 */
export const deleteTagFromGameId = async (req, res) => {
    try {
        const { id, tag_name } = req.gameIdTagNameParam;

        const tag = await prisma.tag.findUnique({ where: { name: tag_name } })
        if (!tag) return res.status(404).send({ message: "Tag non trouvé" })

        await prisma.game_tag.delete({
            where: {
                game_id_tag_name: {
                    game_id: id,
                    tag_name: tag.name
                }
            }
        })

        res.sendStatus(204)
    } catch (err) {
        res.sendStatus(500)
    }
}

/**
 * @swagger
 * /tag:
 *   post:
 *     summary: Create a new tag
 *     description: Create a new tag in the system
 *     tags:
 *       - Tag
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *       500:
 *         description: Server error
 */
export const addTag = async (req, res) => {
    try {
        const {
            name,
        } = req.val;
        const { id } = await prisma.tag.create({
            data: {
                name,
            },
        });
        res.status(201).send({ id });
    } catch (err) {

        res.sendStatus(500);
    }
}

/**
 * @swagger
 * /tag/{id}:
 *   delete:
 *     summary: Delete a tag
 *     description: Delete a tag from the system (admin only)
 *     tags:
 *       - Tag
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag name
 *     responses:
 *       204:
 *         description: Tag deleted successfully
 *       403:
 *         description: Unauthorized - admin access required
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Server error
 */
export const deleteTag = async (req, res) => {
    try {
        const { name } = req.gameParamsVal

        const existing = await prisma.tag.findUnique({ where: { name } })

        if (!existing) return res.sendStatus(404)
        if (!req.user.is_admin)
            return res.status(403).send({ message: "Accès refusé" })

        await prisma.tag.delete({ where: { name } })

        res.sendStatus(204)
    } catch (e) {
        res.sendStatus(500)
    }

}
