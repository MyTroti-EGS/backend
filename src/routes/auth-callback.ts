import { Application, Request, Response } from "express";
import BackendApp from "../BackendApp";
import Route from "../lib/Route";
import { verify } from "jsonwebtoken";
import User from "../models/User";

export default class AuthCallbackRoute extends Route {
    constructor(manager: BackendApp, app: Application) {
        super(manager, app, {
            name: 'AuthCallback',
            path: '/auth/callback',
        });
    }

    async get(req: Request, res: Response) {
        const { token } = req.query;
        if (!token) {
            return res.status(400).send('Token is required');
        }

        const idp_api_key = process.env.IDENTITY_PROVIDER_API_KEY;
        if (!idp_api_key) {
            return res.status(500).send('Identity provider API key is not set');
        }

        const info: any = verify(token as string, idp_api_key);

        const user = await User.create({
            name: info['name'],
            email: info['email'],
            idp_id: info['id'],
        });

        const jwt = user.generateJWT();

        return res.send(jwt);
    }
}
