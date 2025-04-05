import { Application, Request, Response } from "express";
import BackendApp from "../../BackendApp";
import Route from "../../lib/Route";
import Invoice from "../../models/Invoice";

const paymentForm = (payments_url: string, payments_api_key: string, payment_id: string) => `
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
        <form action="${payments_url}/v1/payment/${payment_id}" method="POST">
            <input type="hidden" name="api_key" value="${payments_api_key}">
            If you are not redirected automatically within 5 seconds, click <a href="#" onclick="document.forms[0].submit(); return false;">here</a>.
        </form>
    </body>
</html>
`;

export default class PaymentRoute extends Route {
    constructor(manager: BackendApp, app: Application) {
        super(manager, app, {
            name: 'InvoicePayment',
            path: '/pay/:id',
        });
    }

    async get(req: Request, res: Response) {
        const payment_url = process.env.PAYMENTS_URL;
        if (!payment_url) {
            return res.status(500).send({
                error: "Internal Server Error",
                message: "Payments URL is not set",
            });
        }
        
        const payment_api_key = process.env.PAYMENTS_API_KEY;
        if (!payment_api_key) {
            return res.status(500).send({
                error: "Internal Server Error",
                message: "Payments API key is not set",
            });
        }

        const invoiceId = req.params.id;
        if (!invoiceId) {
            return res.status(400).send({
                error: "Bad Request",
                message: "Invoice ID is required",
            });
        }

        const invoice = await Invoice.findByPk(invoiceId);
        if (!invoice) {
            return res.status(404).send({
                error: "Not Found",
                message: "Invoice not found",
            });
        }

        const paymentId = invoice.paymentId;
        if (!paymentId) {
            return res.status(500).send({
                error: "Bad Request",
                message: "Payment ID was not generated, please contact support",
            });
        }

        return res.send(paymentForm(payment_url, payment_api_key, paymentId));
    }
}
