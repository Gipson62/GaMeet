import { Router } from "express";

import {default as userRouter } from "./v1/user.js";

const router = Router();

const v1Router = Router();

v1Router.use("/user", userRouter);

router.use("/v1", v1Router);

export default router;