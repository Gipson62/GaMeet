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
