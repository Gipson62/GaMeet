import Router from 'express';
import {
    addUser,
    loginUser,
    updateUser,
    deleteUser,
    getUser,
    getAllUsers
} from '../../controller/userORM.js';
import {checkJWT} from '../../middleware/identification/jwt.js';
import {userValidatorMiddleware as CVM} from '../../middleware/validation.js';
import {admin} from '../../middleware/authorization/mustBe.js';



const router = Router();

// AUTH
router.post('/register', CVM.create, addUser)
router.post('/login', CVM.login, loginUser)

// USER SELF
router.get('/', checkJWT, CVM.profile, getUser)
router.patch('/', checkJWT , CVM.update, updateUser)
router.delete('/', checkJWT, CVM.delete ,deleteUser)

// ADMIN USER MANAGEMENT
router.get("/list", checkJWT, admin, getAllUsers);
router.get('/:id', checkJWT, admin, CVM.idParam, getUser)
router.delete('/:id', checkJWT, admin, CVM.idParam, deleteUser)


export default router
