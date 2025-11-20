import Router from 'express';
import reviewRouter from './review.js';
import {
    getAllEvents,
    getEventById,
    addEvent,
    updateEvent,
    deleteEvent
} from '../../controller/eventORM.js';
import { checkJWT } from '../../middleware/identification/jwt.js';
import { eventValidatorMiddleware as EVM } from '../../middleware/validation.js';

const router = Router();

router.post('/', checkJWT, EVM.create, addEvent);
router.get('/', getAllEvents);
router.get('/:id', EVM.idParam, getEventById);
router.patch('/:id', checkJWT, EVM.idParam, EVM.update, updateEvent);
router.delete('/:id', checkJWT, EVM.idParam, deleteEvent);
router.use('/:id/review', EVM.idParam, reviewRouter);
export default router;


