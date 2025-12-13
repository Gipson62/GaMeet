import Router from 'express';
import {
    getAllTags,
    addTag,
    deleteTag,
    getAllTagFromGameId,
    deleteTagFromGameId,
    addTagFromGameId,
} from '../../controller/tagORM.js';
import { checkJWT } from '../../middleware/identification/jwt.js';
import { tagValidatorMiddleware as GVM } from '../../middleware/validation.js';

const router = Router();

router.post('/', checkJWT, GVM.create, addTag);
router.get('/', getAllTags);
router.delete('/:id', checkJWT, GVM.nameParam, deleteTag);
router.get('/game/:id', GVM.gameIdParam, getAllTagFromGameId);
router.post('/game/:id', checkJWT, GVM.gameIdTagNameParam, addTagFromGameId);
router.delete('/game/:id', checkJWT, GVM.gameIdTagNameParam, deleteTagFromGameId);

export default router;


