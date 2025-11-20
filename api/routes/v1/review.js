import Router from 'express'
import {
    getReviewsOfEvent,
    getReviewById,
    addReview,
    updateReview,
    deleteReview,
    getAllReviews
} from '../../controller/reviewORM.js'
import { checkJWT } from '../../middleware/identification/jwt.js'
import { reviewValidatorMiddleware as RVM } from '../../middleware/validation.js'

const router = Router({ mergeParams: true }); // récupère eventId du routeur parent

router.post('/', checkJWT, RVM.create, addReview);
router.get('/all', getAllReviews);
router.get('/', getReviewsOfEvent);
router.get('/:reviewId', RVM.idParam, getReviewById);
router.patch('/:reviewId', checkJWT, RVM.idParam, RVM.update, updateReview);
router.delete('/:reviewId', checkJWT, RVM.idParam, deleteReview);

export default router;
