import Router from 'express';
import {
    upload,
    getPhotoById,
    addPhoto,
    deletePhoto
} from '../../controller/photoORM.js';
import { checkJWT } from '../../middleware/identification/jwt.js';
import { photoValidatorMiddleware as PVM } from '../../middleware/validation.js';

const router = Router();

router.post('/', checkJWT, upload.single("photo"), addPhoto);
router.get('/:id', PVM.idParam, getPhotoById);
router.delete('/:id', checkJWT, PVM.idParam, deletePhoto);

export default router;
