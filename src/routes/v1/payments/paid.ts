import { Application, Request, Response } from "express";
import BackendApp from "../../../BackendApp";
import Route from "../../../lib/Route";
import Invoice from "../../../models/Invoice";

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
        // TODO: Redirect to the application
        return res.status(200).json({ message: 'Invoice marked as paid, you can close this window and return to the application' });
    }
}
