import prisma from '../database/databaseORM.js'
import fs from 'fs'

// Photo cleanup handled inline (same approach as gameORM)

/**
 * @swagger
 * /event:
 *   get:
 *     summary: Get all events
 *     description: Retrieve a list of all gaming events with associated games and participant count
 *     tags:
 *       - Event
 *     responses:
 *       200:
 *         description: List of events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EventList'
 *       500:
 *         description: Server error
 */
export const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        scheduled_date: true,
        location: true,
        description: true,
        max_capacity: true,
        author: true,
        event_game: {
          include: {
            game: true
          }
        },
        event_photo: { include: { photo: true } },
        participant: { include: { User: { select: { id: true } } } },
        _count: {
          select: { participant: true } // récupère le nombre d'inscrits
        }
      },
      orderBy: { scheduled_date: 'asc' }
    })

    res.send(events)
  } catch (err) {

    res.sendStatus(500)
  }
}

/**
 * @swagger
 * /event/{id}:
 *   get:
 *     summary: Get event details by ID
 *     description: Retrieve comprehensive event information including organizer, games, photos, participants, and reviews
 *     tags:
 *       - Event
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventDetail'
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
export const getEventById = async (req, res) => {
  try {

    const { id } = req.eventParamsVal;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        User: { select: { id: true, pseudo: true, email: true, photo: true } },
        event_game: { include: { game: true } },
        event_photo: { include: { photo: true } },
        participant: { include: { User: { select: { id: true, pseudo: true } } } },
        review: { include: { User: { select: { id: true, pseudo: true } }, photo: true } },
        _count: { select: { participant: true } }
      }
    });
    if (event) {
      res.send(event)
    } else {
      res.sendStatus(404)
    }
  } catch (e) {

    res.sendStatus(500)
  }
}

/**
 * @swagger
 * /event:
 *   post:
 *     summary: Create a new event
 *     description: Create a new gaming event with games and photos
 *     tags:
 *       - Event
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
 *               - scheduled_date
 *             properties:
 *               name:
 *                 type: string
 *               scheduled_date:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               max_capacity:
 *                 type: integer
 *               game_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *               photo_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *       401:
 *         description: Unauthorized - user must be authenticated
 *       500:
 *         description: Server error
 */
export const addEvent = async (req, res) => {
  try {
    const { name, scheduled_date, description, location, max_capacity, game_id, photo_id } = req.val
    const author = req.user?.id

    if (!author) {
      return res.status(401).send({ message: 'Utilisateur non authentifié' })
    }
    const { id } = await prisma.event.create({
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
        } : undefined,
        participant: {
          create: { user_id: author },
        },
      },
      select: { id: true, name: true }
    })

    res.status(201).send({ id })
  } catch (e) {

    res.sendStatus(500)
  }
}

/**
 * @swagger
 * /event/{id}:
 *   patch:
 *     summary: Update event information
 *     description: Update event details including games and photos (creator or admin only)
 *     tags:
 *       - Event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               scheduled_date:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               max_capacity:
 *                 type: integer
 *               game_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *               photo_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       204:
 *         description: Event updated successfully
 *       403:
 *         description: Unauthorized - only creator or admin can update
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.eventParamsVal;
    const author = req.user?.id;

    const existing = await prisma.event.findUnique({
      where: { id }
    });

    if (!existing) return res.sendStatus(404);
    if (existing.author !== author && !req.user.is_admin) {
      return res.status(403).send({ message: "Accès refusé" });
    }

    const updateData = { ...req.val };

    delete updateData.id;
    delete updateData.author;

    if (updateData.scheduled_date) {
      updateData.scheduled_date = new Date(updateData.scheduled_date);
    }

    // Capture old photo ids for cleanup later
    const oldEventPhotos = await prisma.event_photo.findMany({ where: { event_id: id }, select: { photo_id: true } });
    const oldPhotoIds = oldEventPhotos.map(p => p.photo_id);

    const newPhotoIds = Array.isArray(req.val.photo_id) ? req.val.photo_id : null;

    await prisma.$transaction(async (tx) => {
      // 🎮 games
      if (Array.isArray(updateData.game_id)) {
        await tx.event_game.deleteMany({ where: { event_id: id } });
        await tx.event_game.createMany({
          data: updateData.game_id.map(gameId => ({
            event_id: id,
            game_id: gameId
          }))
        });
        delete updateData.game_id; 
      }

      // 🖼 photos
      if (Array.isArray(updateData.photo_id)) {
        await tx.event_photo.deleteMany({ where: { event_id: id } });
        await tx.event_photo.createMany({
          data: updateData.photo_id.map(photoId => ({
            event_id: id,
            photo_id: photoId
          }))
        });
        delete updateData.photo_id; 
      }

      await tx.event.update({
        where: { id },
        data: updateData
      });
    });

    // Remove photos that were detached from this event (delete file + DB row, same as gameORM)
    if (Array.isArray(newPhotoIds)) {
      const removed = oldPhotoIds.filter(pid => !newPhotoIds.includes(pid));
      for (const pid of removed) {
        try {
          const photo = await prisma.photo.findUnique({ where: { id: pid } });
          if (photo?.url) {
            fs.unlink(`./uploads/${photo.url}`, () => { });
          }
          await prisma.photo.delete({ where: { id: pid } });
        } catch (cleanupErr) {
          console.error('Erreur suppression photo associée', cleanupErr);
        }
      }
    }

    res.sendStatus(204);

  } catch (e) {
    console.error('UPDATE EVENT ERROR:', e);
    res.sendStatus(500);
  }
};

/**
 * @swagger
 * /event/{id}:
 *   delete:
 *     summary: Delete an event
 *     description: Delete an event and associated photos (creator or admin only)
 *     tags:
 *       - Event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       204:
 *         description: Event deleted successfully
 *       403:
 *         description: Unauthorized - only creator or admin can delete
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.eventParamsVal
    const author = req.user?.id

    const existing = await prisma.event.findUnique({ where: { id: id } })

    if (!existing) return res.sendStatus(404)
    if (existing.author !== author && !req.user.is_admin)
      return res.status(403).send({ message: "Accès refusé" })

    // gather photo ids associated to this event before deletion
    const eventPhotos = await prisma.event_photo.findMany({ where: { event_id: id }, select: { photo_id: true } })
    const photoIds = eventPhotos.map(p => p.photo_id)

    // delete the event (cascade will remove event_photo entries)
    // supprimer les photos associées (fichiers + entrées DB) — same as gameORM
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

    await prisma.event.delete({ where: { id } })

    res.sendStatus(204)
  } catch (e) {

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

    res.status(500).json({ message: 'Erreur interne' });
  }
};
