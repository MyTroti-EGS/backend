import { Application, Request, Response } from "express";
import BackendApp from "../../../BackendApp";
import Route from "../../../lib/Route";
import { verify } from "jsonwebtoken";
import User from "../../../models/User";
import Invoice from "../../../models/Invoice";

export default class TripEndRoute extends Route {
    constructor(manager: BackendApp, app: Application) {
        super(manager, app, {
            name: 'TripEnd',
            path: '/v1/trip/end',
        });
    }
    
    async post(req: Request, res: Response) {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ error: "Bad Request", message: 'Authorization header missing' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: "Bad Request", message: 'Token missing' });
        }

        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            return res.status(500).json({ error: "Internal Server Error", message: 'JWT secret not set' });
        }

        let userId;
        try {
            const decoded: any = verify(token, JWT_SECRET);
            userId = decoded.id;
        } catch (err) {
            return res.status(401).json({ error: "Unauthorized", message: 'Invalid token' });
        }
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(401).json({ error: "Unauthorized", message: 'User not found' });
        }

        const trip = await user.getActiveTrip();
        if (!trip) {
            return res.status(400).json({ error: "Bad Request", message: 'User does not have an active trip' });
        }

        const SCOOTER_MONITOR_URL = process.env.SCOOTER_MONITOR_URL;
        const SCOOTER_MONITOR_API_KEY = process.env.SCOOTER_MONITOR_API_KEY;
        if (!SCOOTER_MONITOR_URL || !SCOOTER_MONITOR_API_KEY) { 
            return res.status(500).json({ error: "Internal Server Error", message: 'Scooter monitor URL or API key not set' });
        }
        const url = `${SCOOTER_MONITOR_URL}/v1/scooters/${trip.scooterId}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "x-api-key": SCOOTER_MONITOR_API_KEY,
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            return res.status(500).json({ error: "Internal Server Error", message: 'Failed to fetch scooter data' });
        }

        const scooterData = await response.json();
        if (!scooterData) {
            return res.status(500).json({ error: "Internal Server Error", message: 'Failed to fetch scooter data' });
        }
        if (scooterData.status !== 'OCCUPIED') {
            return res.status(400).json({ error: "Bad Request", message: 'Scooter is not occupied' });
        }

        const tripEndTime = new Date();
        trip.endedAt = tripEndTime;
        await trip.save();
        
        const updateResponse = await fetch(`${SCOOTER_MONITOR_URL}/v1/scooters/${trip.scooterId}/status`, {
            method: 'PATCH',
            headers: {
                "x-api-key": SCOOTER_MONITOR_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: 'AVAILABLE' }),
        });
        if (!updateResponse.ok) {
            return res.status(500).json({ error: "Internal Server Error", message: 'Failed to update scooter status' });
        }

        const COST_PER_MINUTE = 0.1;
        const tripDuration = (tripEndTime.getTime() - trip.startedAt.getTime()) / 1000; // in seconds
        const tripCost = Math.round((tripDuration * COST_PER_MINUTE / 60) * 100) / 100;

        const invoice = await Invoice.create({
            amount: tripCost,
            userId: user.id,
            currency: 'EUR',
            items: [
                {
                    description: 'Scooter Trip',
                    amount: COST_PER_MINUTE,
                    quantity: (tripDuration / 60).toFixed(2),
                    total: tripCost,
                }
            ]
        });

        const PAYMENTS_URL = process.env.PAYMENTS_URL;
        const PAYMENTS_API_KEY = process.env.PAYMENTS_API_KEY;
        const BASE_URL = process.env.BASE_URL;
        if (!BASE_URL) {
            return res.status(500).json({ error: "Internal Server Error", message: 'Base URL not set' });
        }
        if (!PAYMENTS_URL || !PAYMENTS_API_KEY) {
            return res.status(500).json({ error: "Internal Server Error", message: 'Payments URL or API key not set' });
        }
        const paymentResponse = await fetch(`${PAYMENTS_URL}/v1/payment`, {
            method: 'POST',
            headers: {
                "X-API-Key": PAYMENTS_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: tripCost,
                currency: 'EUR',
                metadata: { items: invoice.items },
                redirect_url: `${BASE_URL}/v1/payments/paid?invoiceId=${invoice.id}`,
            }),
        });
        if (!paymentResponse.ok) {
            return res.status(500).json({ error: "Internal Server Error", message: 'Failed to create payment' });
        }

        const paymentData = await paymentResponse.json();
        if (!paymentData) {
            return res.status(500).json({ error: "Internal Server Error", message: 'Failed to create payment' });
        }
        if (!paymentData.id) {
            return res.status(500).json({ error: "Internal Server Error", message: 'Failed to create payment' });
        }

        invoice.paymentId = paymentData.id;
        await invoice.save();
        return res.status(200).json({
            message: 'Trip ended successfully',
            tripId: trip.id,
            scooterId: trip.scooterId,
            tripCost,
            paymentUrl: paymentData.url,
            invoiceId: invoice.id,
            paymentId: paymentData.id,
        });
    }
}
