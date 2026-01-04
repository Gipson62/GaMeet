import Router from 'express';
import {
    getAllGames,
    getGameById,
    addGame,
    addGameWithPhotos,
    updateGame,
    deleteGame,
} from '../../controller/gameORM.js';
import { checkJWT } from '../../middleware/identification/jwt.js';
import { gameValidatorMiddleware as GVM } from '../../middleware/validation.js';
import { upload } from '../../controller/photoORM.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     GameList:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         studio:
 *           type: string
 *         publisher:
 *           type: string
 *         platforms:
 *           type: string
 *         release_date:
 *           type: string
 *           format: date-time
 *         logo_id:
 *           type: integer
 *         grid_id:
 *           type: integer
 *         banner_id:
 *          type: integer
 *         is_approved:
 *           type: boolean
 *       example:
 *         id: 1
 *         name: "Elden Ring"
 *         studio: "FromSoftware"
 *         publisher: "Bandai Namco Entertainment"
 *         platforms: "PC, PS4, PS5, Xbox One, Xbox Series X/S"
 *         release_date: "2022-02-25T00:00:00Z"
 *         logo_id: 5
 *         is_approved: true
 *
 *     GameDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         studio:
 *           type: string
 *         publisher:
 *           type: string
 *         description:
 *           type: string
 *         platforms:
 *           type: string
 *         release_date:
 *           type: string
 *           format: date-time
 *         banner_id:
 *           type: integer
 *         logo_id:
 *           type: integer
 *         grid_id:
 *           type: integer
 *         is_approved:
 *           type: boolean
 *         event_game:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               event:
 *                 type: object
 *         game_tag:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               tag_name:
 *                 type: string
 *       example:
 *         id: 1
 *         name: "Elden Ring"
 *         studio: "FromSoftware"
 *         publisher: "Bandai Namco Entertainment"
 *         description: "Blends open-world exploration with challenging combat..."
 *         platforms: "PC, PS4, PS5, Xbox One, Xbox Series X/S"
 *         release_date: "2022-02-25T00:00:00Z"
 *         banner_id: 3
 *         logo_id: 4
 *         grid_id: 5
 *         is_approved: true
 *         event_game: []
 *         game_tag: [{"tag_name": "Soulslike"}, {"tag_name": "RPG"}]
 */

const router = Router();

router.post('/', checkJWT, GVM.create, addGame);
router.post('/with-photos', checkJWT, upload.fields([{ name: 'banner', maxCount: 1 }, { name: 'logo', maxCount: 1 }, { name: 'grid', maxCount: 1 }]), addGameWithPhotos);
router.get('/', getAllGames);
router.get('/:id', GVM.idParam, getGameById);
router.patch('/:id', checkJWT, GVM.idParam, GVM.update, updateGame);
router.delete('/:id', checkJWT, GVM.idParam, deleteGame);

export default router;


