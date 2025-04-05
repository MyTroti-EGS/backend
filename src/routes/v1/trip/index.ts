import { Application, Request, Response } from "express";
import BackendApp from "../../../BackendApp";
import Route from "../../../lib/Route";
import { verify } from "jsonwebtoken";
import User from "../../../models/User";

export default class TripStatusRoute extends Route {
    constructor(manager: BackendApp, app: Application) {
        super(manager, app, {
            name: 'TripStatus',
            path: '/v1/trip',
        });
    }

    async get(req: Request, res: Response) {
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
        return res.status(200).json({
            state: trip ? "TRIP" : "NO_TRIP",
            trip: trip ? {
                id: trip.id,
                startDate: trip.startedAt.toISOString(),
                scooterId: trip.scooterId,
            } : null,
        });
    }
}
