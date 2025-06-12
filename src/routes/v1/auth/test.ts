import { Application, Request, Response } from "express";
import BackendApp from "../../../BackendApp";
import Route from "../../../lib/Route";
import { verify } from "jsonwebtoken";
import User from "../../../models/User";

export default class AuthTestRoute extends Route {
    constructor(manager: BackendApp, app: Application) {
        super(manager, app, {
            name: 'AuthTest',
            path: '/v1/auth/test',
        });
    }

    async get(req: Request, res: Response) {
        const { token } = req.query;
        if (!token) {
            return res.status(400).send({
                error: 'Bad Request',
                message: 'Token is required',
            });
        }

        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            return res.status(500).send({
                error: 'Internal Server Error',
                message: 'JWT_SECRET is not set',
            });
        }

        const info: any = verify(token as string, JWT_SECRET);

        return res.status(200).send({
            message: 'Token is valid',
            user: info,
            jwt: token,
        });
    }
}
