import Router from 'express';
import { checkJWT } from '../../middleware/identification/jwt.js';

import { participantValidatorMiddleware as PVM } from '../../middleware/validation.js';
import {
  addParticipant,
  removeParticipant,
  
} from '../../controller/participantORM.js';


const router = Router();

router.post('/', checkJWT, PVM.create, addParticipant);
router.delete('/', checkJWT, PVM.remove, removeParticipant);

export default router;


