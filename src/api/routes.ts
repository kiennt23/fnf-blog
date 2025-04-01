import { Router } from "express";
import editorRoutes from "./editor/routes";
import { authenticated } from "../middlewares/authenticated.ts";

const router = Router();

router.get("/ping", (req, res) => {
  res.send("pong");
});

router.use("/editor", authenticated, editorRoutes);

export default router;
