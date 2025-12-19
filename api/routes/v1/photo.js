import Router from 'express';
import {
    upload,
    getPhotoById,
    addPhoto,
    deletePhoto
} from '../../controller/photoORM.js';
import { checkJWT } from '../../middleware/identification/jwt.js';
import { photoValidatorMiddleware as PVM } from '../../middleware/validation.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Photo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique photo identifier
 *         url:
 *           type: string
 *           description: Filename of the photo in the uploads directory
 *       required:
 *         - id
 *         - url
 *       example:
 *         id: 1
 *         url: "1703001234567-example.jpg"
 */

const router = Router();

router.post('/', checkJWT, upload.single("photo"), addPhoto);
router.get('/:id', PVM.idParam, getPhotoById);
router.delete('/:id', checkJWT, PVM.idParam, deletePhoto);

export default router;
