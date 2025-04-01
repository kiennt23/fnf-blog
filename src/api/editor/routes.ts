import { Router } from "express";
import prismaClient from "../../prisma/client";

const router = Router();

router.post("/save", async (req, res) => {
  const thePost = req.body;
  const savedPost = await prismaClient.post.upsert({
    ...thePost,
  });

  res.send(savedPost);
});

export default router;
