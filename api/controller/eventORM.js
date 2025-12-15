import prisma from '../database/databaseORM.js'

export const getAllEvents = async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            select: {
                id: true,
                name: true,
                scheduled_date: true,
                location: true,
                max_capacity: true,
                event_game: {
                    include: {
                        game: true
                    }
                },
                _count: {
                    select: { participant: true } // récupère le nombre d'inscrits
                }
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
                review: { include: { User: { select: { id: true, pseudo: true } }, photo: true } },
                _count: {
                    select: { participant: true } // récupère le nombre d'inscrits
                }
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
export const joinEvent = async (req, res) => {
    try {
        const userId = req.user?.id;
        const eventId = req.eventParamsVal.id;

        if (!userId) return res.status(401).json({ message: 'Utilisateur non authentifié' });

        const event = await prisma.event.findUnique({ where: { id: eventId } })
        if (!event) return res.status(404).json({ message: 'Événement introuvable' });

        // Vérifier si l'utilisateur est déjà inscrit
        const existing = await prisma.participant.findUnique({
            where: { event_id_user_id: { event_id: eventId, user_id: userId } }
        });
        if (existing) return res.status(400).json({ message: 'Déjà inscrit à cet événement' });

        // Vérifier la capacité
        if (event.max_capacity !== null) {
            const participantCount = await prisma.participant.count({ where: { event_id: eventId } });
            if (participantCount >= event.max_capacity) {
                return res.status(400).json({ message: 'L’événement est complet' });
            }
        }

        // Ajouter l'inscription
        await prisma.participant.create({
            data: { event_id: eventId, user_id: userId }
        });

        res.status(201).json({ message: 'Inscription réussie !' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur interne' });
    }
};
// Désinscription d'un événement
export const leaveEvent = async (req, res) => {
    try {
        const userId = req.user?.id;
        const eventId = req.eventParamsVal.id;

        if (!userId) return res.status(401).json({ message: 'Utilisateur non authentifié' });

        // Vérifier que l'inscription existe
        const existing = await prisma.participant.findUnique({
            where: { event_id_user_id: { event_id: eventId, user_id: userId } }
        });
        if (!existing) return res.status(404).json({ message: "Vous n'êtes pas inscrit à cet événement" });

        // Supprimer l'inscription
        await prisma.participant.delete({
            where: { event_id_user_id: { event_id: eventId, user_id: userId } }
        });

        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur interne' });
    }
};