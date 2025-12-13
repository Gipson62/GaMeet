import { Router } from "express";

import {default as userRouter } from "./v1/user.js";
import { default as eventRouter } from "./v1/event.js";
import { default as reviewRouter } from "./v1/review.js";
import { default as gameRouter } from "./v1/game.js";
import { default as tagRouter } from "./v1/tag.js";
import { default as photoRouter } from "./v1/photo.js";
const router = Router();

const v1Router = Router();

v1Router.use("/user", userRouter);
v1Router.use("/event", eventRouter);
v1Router.use('/review', reviewRouter);
v1Router.use("/game", gameRouter);
v1Router.use("/tag", tagRouter);
v1Router.use("/photo", photoRouter);
router.use("/v1", v1Router);

export default router;