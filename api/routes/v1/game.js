import Router from 'express';
import {
    getAllGames,
    getGameById,
    addGame,
    updateGame,
    deleteGame
} from '../../controller/gameORM.js';
import { checkJWT } from '../../middleware/identification/jwt.js';
import { gameValidatorMiddleware as GVM } from '../../middleware/validation.js';

const router = Router();

router.post('/', checkJWT, GVM.create, addGame);
router.get('/', getAllGames);
router.get('/:id', GVM.idParam, getGameById);
router.patch('/:id', checkJWT, GVM.idParam, GVM.update, updateGame);
router.delete('/:id', checkJWT, GVM.idParam, deleteGame);

export default router;


