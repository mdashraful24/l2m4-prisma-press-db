import { NextFunction, Request, Response } from "express";

export type TypeController = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void>
