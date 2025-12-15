import prisma from '../database/databaseORM.js'

export const getAllEvents = async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            select: {
                id: true,
                name: true,
                scheduled_date: true,
                location: true,
                max_capacity: true
            },
            orderBy: { scheduled_date: 'asc' }
        })
        res.send(events)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
}
export const getEventById = async (req, res) => {
    try {

        const  {id}  = req.eventParamsVal;

        const event = await prisma.event.findUnique({
            where: {
                id : id
            },
            include: {
                User: { select: { id: true, pseudo: true, email: true } },
                event_game: { include: { game: true } },
                event_photo: { include: { photo: true } },
                participant: { include: { User: { select: { id: true, pseudo: true } } } },
                review: { include: { User: { select: { id: true, pseudo: true } }, photo: true } }
            }
        })

        if (event) {
            res.send(event)
        } else {
            res.sendStatus(404)
        }
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }
}

export const addEvent = async (req, res) => {
    try {
        const { name, scheduled_date, description, location, max_capacity, game_id, photo_id } = req.val
        const author = req.user?.id

        if (!author) {
            return res.status(401).send({ message: 'Utilisateur non authentifié' })
        }
        const {id} = await prisma.event.create({
            data: {
                name,
                scheduled_date: new Date(scheduled_date),
                description: description ?? null,
                location: location ?? null,
                max_capacity: max_capacity ? parseInt(max_capacity) : null,
                author,
                event_game: game_id ? {
                    create: game_id.map(gameId => ({ game_id: gameId }))
                } : undefined,
                event_photo: photo_id ? {
                    create: photo_id.map(photoId => ({ photo_id: photoId }))
                } : undefined
            },
            select: { id: true, name: true }
        })

        res.status(201).send({id})
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }
}

export const updateEvent = async (req, res) => {
    try {
        const { id } = req.eventParamsVal
        const author = req.user?.id

        const existing = await prisma.event.findUnique({ where: { id: id } })

        if (!existing) return res.sendStatus(404)
        if (existing.author !== author && !req.user.is_admin)
            return res.status(403).send({ message: "Accès refusé" })
        
        
        const updateData  = {...req.val}

        delete updateData.id
        delete updateData.author

        if (updateData.scheduled_date) {
            updateData.scheduled_date = new Date(updateData.scheduled_date);
        }

        // Supprime les anciennes relations et ajoute les nouvelles
        await prisma.$transaction(async (tx) => {
            if (updateData.game_id) {
                await tx.event_game.deleteMany({ where: { event_id: id } })
                updateData.event_game = {
                create: updateData.game_id.map(gameId => ({ game_id: gameId }))
                }
            }

            if (updateData.photo_id) {
                await tx.event_photo.deleteMany({ where: { event_id: id } })
                updateData.event_photo = {
                create: updateData.photo_id.map(photoId => ({ photo_id: photoId }))
                }
            }

            await tx.event.update({
                where: { id },
                data: updateData
            })
        })

        res.sendStatus(204)

    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }
}

export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.eventParamsVal
        const author = req.user?.id
        
        const existing = await prisma.event.findUnique({ where: { id: id } })
        
        if (!existing) return res.sendStatus(404)
        if (existing.author !== author && !req.user.is_admin)
            return res.status(403).send({ message: "Accès refusé" })

        await prisma.event.delete({ where: { id } })

        res.sendStatus(204)
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }
}
