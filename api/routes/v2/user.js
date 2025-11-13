import Router from 'express'
import {
    getUserById,
    addUser,
    loginUser,
    updateUser,
    deleteUser
} from '../../controller/userORM.js';
import {checkJWT} from '../../middleware/identification/jwt.js';
import {userValidatorMiddleware as CVM} from '../../middleware/validation.js';


const router = Router();

router.post('/registration',CVM.register, addUser)
router.post('/login',CVM.login, loginUser)
router.get('/me', checkJWT, getUserById)
router.patch('/me',CVM.update, updateUser)
router.delete('/me', checkJWT, deleteUser)

export default router
