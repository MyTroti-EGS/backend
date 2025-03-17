import { Application, Request, Response } from "express";
import BackendApp from "../BackendApp";
import Route from "../lib/Route";

const loginForm = (idp_url: string, idp_api_key: string, redirect_uri: string) => `
<html>
    <head>
        <title>MyTroti</title>
        <script>
            window.onload = function() {
                document.forms[0].submit();
            };
        </script>
    </head>
    <body>
        <form action="${idp_url}/v1/login" method="POST">
            <input type="hidden" name="apiKey" value="${idp_api_key}">
            <input type="hidden" name="redirect" value="${redirect_uri}">
            If you are not redirected automatically within 5 seconds, click <a href="#" onclick="document.forms[0].submit(); return false;">here</a>.
        </form>
    </body>
</html>
`;

export default class LoginRoute extends Route {
    constructor(manager: BackendApp, app: Application) {
        super(manager, app, {
            name: 'Login',
            path: '/login',
        });
    }

    async get(req: Request, res: Response) {
        const idp_url = process.env.IDENTITY_PROVIDER_URL;
        if (!idp_url) {
            return res.status(500).send('Identity provider URL is not set');
        }

        const idp_api_key = process.env.IDENTITY_PROVIDER_API_KEY;
        if (!idp_api_key) {
            return res.status(500).send('Identity provider API key is not set');
        }

        const redirect_uri = process.env.REDIRECT_URI;
        if (!redirect_uri) {
            return res.status(500).send('Redirect URI is not set');
        }

        return res.send(loginForm(idp_url, idp_api_key, redirect_uri));
    }
}
