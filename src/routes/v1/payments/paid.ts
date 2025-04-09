import { Application, Request, Response } from "express";
import BackendApp from "../../../BackendApp";
import Route from "../../../lib/Route";
import Invoice from "../../../models/Invoice";

const paymentCompleteForm = (frontend_redirect_uri: string) => `
<html>
    <head>
        <title>MyTroti</title>
        <script>
            window.onload = function() {
                window.location.href = "${frontend_redirect_uri}";
            };
        </script>
    </head>
    <body>
        <p>Payment completed successfully. Redirecting to application...</p>
        <p>If you are not redirected automatically within 5 seconds, click <a href="${frontend_redirect_uri}">here</a>.</p>
    </body>
</html>
`;

export default class PaymentCompleteRoute extends Route {
    constructor(manager: BackendApp, app: Application) {
        super(manager, app, {
            name: 'PaymentComplete',
            path: '/v1/payments/paid',
        });
    }

    async get(req: Request, res: Response) {
        const { invoiceId } = req.query;
        if (!invoiceId) {
            return res.status(400).json({ error: "Bad Request", message: 'Invoice ID is required' });
        }

        const invoice = await Invoice.findByPk(invoiceId as string);
        if (!invoice) {
            return res.status(404).json({ error: "Not Found", message: 'Invoice not found' });
        }

        await invoice.markAsPaid();

        const frontend_redirect_uri = process.env.FRONTEND_PAYMENT_REDIRECT_URI;
        if (!frontend_redirect_uri) {
            return res.status(500).send({
                error: 'Internal Server Error',
                message: 'Frontend redirect URI is not set',
            });
        }

        return res.send(paymentCompleteForm(frontend_redirect_uri));
    }
}
