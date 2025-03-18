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

        const [user, _] = await User.findOrCreate({
            where: {
                idp_id: info.id,
            },
            defaults: {
                name: info.name,
                idp_id: info.id,
                email: info.email,
            },
        });

        const jwt = user.generateJWT();
        const frontend_redirect_uri = process.env.FRONTEND_REDIRECT_URI;
        if (!frontend_redirect_uri) {
            return res.status(500).send({
                error: 'Internal Server Error',
                message: 'Frontend redirect URI is not set',
            });
        }

        return res.redirect(
            `${frontend_redirect_uri}?token=${jwt}`
        );
    }
}
