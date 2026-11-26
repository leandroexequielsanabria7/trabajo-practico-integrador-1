import { Router } from "express";
import { authRoutes } from "./auth.routes.js";
import { userRoutes } from "./user.routes.js";
import { tagRoutes } from "./tag.routes.js";
import { articleRoutes } from "./article.routes.js";
import { articleTagRoutes } from "./article_tag.routes.js";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/users", userRoutes);
routes.use("/tags", tagRoutes);
routes.use("/articles", articleRoutes);
routes.use("/articles-tags", articleTagRoutes);