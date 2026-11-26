import { Router } from "express";
import { authRoutes } from "./auth.routes.js";
import { userRoutes } from "./user.routes.js";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/users", userRoutes);

import { tagRoutes } from "./tag.routes.js";
routes.use("/tags", tagRoutes);

import { articleRoutes } from "./article.routes.js";
routes.use("/articles", articleRoutes);