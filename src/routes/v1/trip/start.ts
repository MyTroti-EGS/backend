import { Application, Request, Response } from "express";
import BackendApp from "../../../BackendApp";
import Route from "../../../lib/Route";
import { verify } from "jsonwebtoken";
import User from "../../../models/User";
import Trip from "../../../models/Trip";

export default class TripStartRoute extends Route {
    constructor(manager: BackendApp, app: Application) {
        super(manager, app, {
            name: 'TripStart',
            path: '/v1/trip/start',
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

        const { scooterId } = req.body;
        if (!scooterId) {
            return res.status(400).json({ error: "Bad Request", message: 'Scooter ID missing' });
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

        if (await user.getActiveTrip()) {
            return res.status(400).json({ error: "Bad Request", message: 'User already has an active trip' });
        }

        const SCOOTER_MONITOR_URL = process.env.SCOOTER_MONITOR_URL;
        const SCOOTER_MONITOR_API_KEY = process.env.SCOOTER_MONITOR_API_KEY;
        if (!SCOOTER_MONITOR_URL || !SCOOTER_MONITOR_API_KEY) {
            return res.status(500).json({ error: "Internal Server Error", message: 'Scooter monitor URL or API key not set' });
        }

        const url = `${SCOOTER_MONITOR_URL}/v1/scooters/${scooterId}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "x-api-key": SCOOTER_MONITOR_API_KEY,
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            return res.status(500).json({ error: "Internal Server Error", message: 'Failed to fetch scooter info' });
        }

        const scooterInfo = await response.json();
        if (!scooterInfo) {
            return res.status(404).json({ error: "Not Found", message: 'Scooter not found' });
        }
        if (scooterInfo.status !== 'AVAILABLE') {
            return res.status(400).json({ error: "Bad Request", message: 'Scooter not available' });
        }

        const updateResponse = await fetch(`${url}/status`, {
            method: 'PATCH',
            headers: {
                "x-api-key": SCOOTER_MONITOR_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: 'OCCUPIED' }),
        });
        if (!updateResponse.ok) {
            return res.status(500).json({ error: "Internal Server Error", message: 'Failed to update scooter status' });
        }

        await Trip.create({
            scooterId,
            userId,
            startedAt: new Date(),
        });

        return res.status(200).json({ message: 'Trip started successfully', scooterId });
    }
}
