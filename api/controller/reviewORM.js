import prisma from '../database/databaseORM.js';

// Récupérer toutes les reviews
export const getAllReviews = async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            include: {
                User: { select: { id: true, pseudo: true, email: true } },
                event: { select: { id: true, name: true, scheduled_date: true } },
                photo: true
            },
            orderBy: { created_at: 'desc' }
        });
        res.send(reviews);
    } catch (e) {
        res.sendStatus(500);
    }
};
// Récupérer toutes les reviews d'un event
export const getReviewsOfEvent = async (req, res) => {
    try {
        const eventId = req.eventParamsVal.id;
        const reviews = await prisma.review.findMany({
            where: { event_id: eventId },
            include: {
                User: { select: { id: true, pseudo: true, email: true } },
                photo: true
            },
            orderBy: { created_at: 'desc' }
        });
        res.send(reviews);
    } catch (err) {
        
        res.sendStatus(500);
    }
};

// Récupérer une review par son ID
export const getReviewById = async (req, res) => {
    try {
        const id = req.reviewParamsVal.id;   
        const review = await prisma.review.findUnique({
            where: { id },
            include: {
                User: { select: { id: true, pseudo: true, email: true } },
                event: true
            }
        });

        if (!review) return res.sendStatus(404);
        res.send(review);
    } catch (err) {
        
        res.sendStatus(500);
    }
};

// Ajouter une review à un event
export const addReview = async (req, res) => {
    try {
        const eventId = req.eventParamsVal.id;
        const userId = req.user?.id;

        if (!userId) return res.status(401).send({ message: "Utilisateur non authentifié" });

        const { note, description, photo_id } = req.body;

        const review = await prisma.review.create({
            data: {
                event_id: eventId,
                user_id: userId,
                note,
                description: description ?? null,
                photo_id: photo_id ?? null
            }
        });

        res.status(201).send(review);
    } catch (err) {
        
        res.sendStatus(500);
    }
};

// Mettre à jour une review
export const updateReview = async (req, res) => {
    try {
        const reviewId = req.reviewParamsVal.id;
        const userId = req.user?.id;

        const existing = await prisma.review.findUnique({ where: { id: reviewId } });
        if (!existing) return res.sendStatus(404);
        if (existing.user_id !== userId && !req.user.is_admin)
            return res.status(403).send({ message: "Accès refusé" });

        const updateData = { ...req.val };

        await prisma.review.update({
            where: { id: reviewId },
            data: updateData
        });

        res.sendStatus(204);
    } catch (err) {
        
        res.sendStatus(500);
    }
};

// Supprimer une review
export const deleteReview = async (req, res) => {
    try {
        const reviewId = req.reviewParamsVal.id;
        const userId = req.user?.id;

        const existing = await prisma.review.findUnique({ where: { id: reviewId } });
        if (!existing) return res.sendStatus(404);
        if (existing.user_id !== userId && !req.user.is_admin)
            return res.status(403).send({ message: "Accès refusé" });

        await prisma.review.delete({ where: { id: reviewId } });
        res.sendStatus(204);
    } catch (err) {
        
        res.sendStatus(500);
    }
};
