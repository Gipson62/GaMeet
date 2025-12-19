import Router from 'express';
import {
    addUser,
    loginUser,
    updateUser,
    deleteUser,
    getUser,
    getAllUsers,
} from '../../controller/userORM.js';
import { checkJWT } from '../../middleware/identification/jwt.js';
import { userValidatorMiddleware as UVM } from '../../middleware/validation.js';
import { admin } from '../../middleware/authorization/mustBe.js';
import { upload } from "../../controller/photoORM.js";


const router = Router();

// AUTH
router.post('/register', upload.single("avatar"), UVM.create, addUser)
router.post('/login', UVM.login, loginUser)

// USER SELF
router.get('/', checkJWT, UVM.profile, getUser)
router.patch('/', checkJWT, upload.single("avatar"), UVM.update, updateUser)
router.delete('/', checkJWT, UVM.delete, deleteUser)

// ADMIN USER MANAGEMENT
router.get("/list", checkJWT, admin, getAllUsers);
router.get('/:id', checkJWT, admin, UVM.idParam, getUser)
router.patch('/:id', checkJWT, admin, upload.single("avatar"), UVM.update, updateUser)
router.delete('/:id', checkJWT, admin, UVM.idParam, deleteUser)


export default router
