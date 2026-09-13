import express from "express";
export * from "./common";
export * from "./moderation";
export * from "./users";
export * from "./posts";
export * from "./security";
export * from "./analytics";
export * from "./communication";
export * from "./system";

import { moderationRouter } from "./moderation";
import { usersRouter } from "./users";
import { postsRouter } from "./posts";
import { securityRouter } from "./security";
import { analyticsRouter } from "./analytics";
import { communicationRouter } from "./communication";
import { systemRouter } from "./system";

export const adminRouter = express.Router();

adminRouter.use(moderationRouter);
adminRouter.use(usersRouter);
adminRouter.use(postsRouter);
adminRouter.use(securityRouter);
adminRouter.use(analyticsRouter);
adminRouter.use(communicationRouter);
adminRouter.use(systemRouter);
