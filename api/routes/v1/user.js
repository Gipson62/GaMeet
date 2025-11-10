import Router from "express";
import {getUserByID} from "../../controller/userORM.js";

const router = Router();

router.get("/:id", getUserByID);

export default router;