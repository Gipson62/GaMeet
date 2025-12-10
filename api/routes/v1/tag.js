import Router from 'express';
import {
    getAllTags,
    getAllTagFromGameId,
    addTag,
    deleteTag
} from '../../controller/tagORM.js';
import { checkJWT } from '../../middleware/identification/jwt.js';
import { tagValidatorMiddleware as GVM } from '../../middleware/validation.js';

const router = Router();

router.post('/', checkJWT, GVM.create, addTag);
router.get('/', getAllTags);
router.get('/:id', GVM.gameIdParam, getAllTagFromGameId);
router.delete('/:id', checkJWT, GVM.nameParam, deleteTag);

export default router;


