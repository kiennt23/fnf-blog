// Reusable utility function
import { Request, Response } from "express";

export function makeSwappableMiddleware(
  initial: (req: Request, res: Response) => void,
): [
  swap: (next: (req: Request, res: Response) => void) => void,
  middleware: (req: Request, res: Response) => void,
] {
  if (import.meta.hot) {
    let current = initial;
    const swap = (next: (req: Request, res: Response) => void) => {
      current = next;
    };
    const middleware = ((...args) => current(...args)) as (
      req: Request,
      res: Response,
    ) => void;
    return [swap, middleware];
  } else {
    const swap = () => {
      throw new Error("Middleware is not swappable.");
    };
    return [swap, initial];
  }
}
