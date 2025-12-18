import Router from 'express';
import {
    getAllGames,
    getGameById,
    addGame,
    addGameNew,
    updateGame,
    deleteGame,
    updateGamePhoto
} from '../../controller/gameORM.js';
import { checkJWT } from '../../middleware/identification/jwt.js';
import { gameValidatorMiddleware as GVM } from '../../middleware/validation.js';
import { upload } from '../../controller/photoORM.js';

const router = Router();

router.post('/', checkJWT, GVM.create, addGame);
router.post('/with-photos', checkJWT, upload.fields([{ name: 'banner', maxCount: 1 }, { name: 'logo', maxCount: 1 }, { name: 'grid', maxCount: 1 }]), addGameNew);
router.get('/', getAllGames);
router.get('/:id', GVM.idParam, getGameById);
router.patch('/:id', checkJWT, GVM.idParam, GVM.update, updateGame);
router.delete('/:id', checkJWT, GVM.idParam, deleteGame);
router.post('/:id/photo/:type', checkJWT, GVM.idParam, upload.single("photo"), updateGamePhoto);

export default router;


