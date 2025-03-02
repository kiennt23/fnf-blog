import { RequestHandler, Request, Response, NextFunction } from "express";

export const authenticated: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.oidc.isAuthenticated()) {
    res.status(403).send("You must be logged in");
  } else {
    next();
  }
};
