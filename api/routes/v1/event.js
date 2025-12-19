import Router from 'express';
import reviewRouter from './review.js';
import participantRouter  from './participant.js';
import {
    getAllEvents,
    getEventById,
    addEvent,
    updateEvent,
    deleteEvent,
    joinEvent,
    leaveEvent
} from '../../controller/eventORM.js';
import { checkJWT } from '../../middleware/identification/jwt.js';
import { eventValidatorMiddleware as EVM } from '../../middleware/validation.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     EventList:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         scheduled_date:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         max_capacity:
 *           type: integer
 *         user_id:
 *           type: integer
 *         _count:
 *           type: object
 *           properties:
 *             event_game:
 *               type: integer
 *             participants:
 *               type: integer
 *       example:
 *         id: 1
 *         name: "Gaming Marathon 2025"
 *         description: "Join us for an epic gaming session"
 *         scheduled_date: "2025-03-15T18:00:00Z"
 *         location: "Online"
 *         max_capacity: 50
 *         user_id: 2
 *         _count:
 *           event_game: 3
 *           participants: 12
 *
 *     EventDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         scheduled_date:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         max_capacity:
 *           type: integer
 *         user_id:
 *           type: integer
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             username:
 *               type: string
 *             email:
 *               type: string
 *         event_game:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               game:
 *                 $ref: '#/components/schemas/GameList'
 *         event_photo:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               photo_id:
 *                 type: integer
 *               photo:
 *                 $ref: '#/components/schemas/Photo'
 *         participants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               user:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *         reviews:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               rating:
 *                 type: integer
 *               comment:
 *                 type: string
 *       example:
 *         id: 1
 *         name: "Gaming Marathon 2025"
 *         description: "Join us for an epic gaming session"
 *         scheduled_date: "2025-03-15T18:00:00Z"
 *         location: "Online"
 *         max_capacity: 50
 *         user_id: 2
 *         user:
 *           id: 2
 *           username: "organizer"
 *           email: "organizer@example.com"
 *         event_game: []
 *         event_photo: []
 *         participants: []
 *         reviews: []
 */

const router = Router();

// CRUD Events
router.post('/', checkJWT, EVM.create, addEvent);
router.get('/', getAllEvents);
router.get('/:id', EVM.idParam, getEventById);
router.patch('/:id', checkJWT, EVM.idParam, EVM.update, updateEvent);
router.delete('/:id', checkJWT, EVM.idParam, deleteEvent);

// Routes pour s'inscrire / se désinscrire
router.post('/:id/join', checkJWT, EVM.idParam, joinEvent);
router.delete('/:id/leave', checkJWT, EVM.idParam, leaveEvent);

// Routes reviews liées à un event
router.use('/:id/review', EVM.idParam, reviewRouter);
router.use('/:id/participant',EVM.idParam,participantRouter );
export default router;
