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

/**
 * @swagger
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *       required:
 *         - name
 *       example:
 *         name: "Soulslike"
 *
 *     GameTag:
 *       type: object
 *       properties:
 *         tag_name:
 *           type: string
 *       example:
 *         tag_name: "Action"
 */

const router = Router();

router.post('/', checkJWT, GVM.create, addTag);
router.get('/', getAllTags);
router.delete('/:id', checkJWT, GVM.nameParam, deleteTag);
router.get('/game/:id', GVM.gameIdParam, getAllTagFromGameId);
router.post('/game/:id', checkJWT, GVM.gameIdTagNameParam, addTagFromGameId);
router.delete('/game/:id', checkJWT, GVM.gameIdTagNameParam, deleteTagFromGameId);

export default router;


