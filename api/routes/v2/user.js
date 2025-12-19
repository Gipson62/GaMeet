import Router from 'express';
import {
    addUser,
    loginUser,
    updateUser,
    deleteUser,
    getUser,
    getAllUsers
} from '../../controller/userORM.js';
import { checkJWT } from '../../middleware/identification/jwt.js';
import { userValidatorMiddleware as CVM } from '../../middleware/validation.js';
import { admin } from '../../middleware/authorization/mustBe.js';



const router = Router();

// AUTH
router.post('/register', CVM.register, addUser)
router.post('/login', CVM.login, loginUser)

// USER SELF
router.get('/me', checkJWT, CVM.profile, getUser)
router.patch('/me', checkJWT, CVM.update, updateUser)
router.delete('/me', checkJWT, CVM.delete, deleteUser)

// ADMIN USER MANAGEMENT
// A AJOUTER VERIF ADMIN!!!!!!!!
router.get("/list", getAllUsers);
router.get('/:id', CVM.searchedUser, getUser)
router.delete('/:id', CVM.userToDelete, deleteUser)


export default router
