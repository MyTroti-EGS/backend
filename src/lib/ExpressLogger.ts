import { Request, Response, NextFunction } from "express";
import BackendApp from "../BackendApp";

export default function ExpressLogger(manager: BackendApp, req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        manager.logger.createSubLogger("express").info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
}
