import prisma from '../database/databaseORM.js'

export const getAllGames = async (req, res) => {
    try {
        const games = await prisma.game.findMany({
            select: {
                id: true,
                name: true,
                genre: true,
                platform: true,
                release_date: true
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
                genre: true,
                platform: true,
                release_date: true,
                description: true
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
            genre,
            platform,
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
                genre,
                platform,
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
