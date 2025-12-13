import prisma from '../database/databaseORM.js'

export const getAllTags = async (req, res) => {
    try {
        const games = await prisma.tag.findMany({
            select: {
                name: true
            },
        });
        res.send(games);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}

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
        res.send(tags.map(t => t.tag))
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
}

/*
 * Associe un tag à un jeu, crée le tag s'il n'existe pas
 */
export const addTagFromGameId = async (req, res) => {
    try {
        const { id, tag_name } = req.gameTagParamsVal;


        let tag = await prisma.tag.findUnique({ where: { tag_name } })
        if (!tag) {
            tag = await prisma.tag.create({ data: { tag_name } })
        }

        await prisma.game_tag.create({
            data: {
                game_id: id,
                tag_id: tag.id
            }
        })

        res.status(201).send({ message: "Tag ajouté au jeu" })
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
}

/*
 * Retire un tag d'un jeu
 */
export const deleteTagFromGameId = async (req, res) => {
    try {
        const { id, tag_name } = req.gameIdTagNameParam;

        const tag = await prisma.tag.findUnique({ where: { tag_name } })
        if (!tag) return res.status(404).send({ message: "Tag non trouvé" })

        await prisma.game_tag.deleteMany({
            where: {
                game_id: id,
                tag_id: tag.id
            }
        })

        res.sendStatus(204)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
}

export const addTag = async (req, res) => {
    try {
        const {
            name,
        } = req.val;
        const {id} = await prisma.tag.create({
            data: {
                name,
            },
        });
        res.status(201).send({id});
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}

export const deleteTag = async (req, res) => {
    try {
        const { name } = req.gameParamsVal

        const existing = await prisma.game.findUnique({ where: { name } })

        if (!existing) return res.sendStatus(404)
        if (!req.user.is_admin)
            return res.status(403).send({ message: "Accès refusé" })

        await prisma.game.delete({ where: { name } })

        res.sendStatus(204)
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }

}
