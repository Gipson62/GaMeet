import { Router } from "express";

import {default as userRouter } from "./v1/user.js";
import { default as eventRouter } from "./v1/event.js";

const router = Router();

const v1Router = Router();

v1Router.use("/user", userRouter);
v1Router.use("/event", eventRouter);
router.use("/v1", v1Router);

export default router;