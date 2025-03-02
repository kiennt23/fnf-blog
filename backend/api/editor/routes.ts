import { Router } from "express";

const router = Router();

router.post("/save", (req, res) => {
  console.log(req.body);

  res.send(req.body);
});

export default router;
