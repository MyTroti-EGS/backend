import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import User from '../../models/User';
import { verify } from 'jsonwebtoken';

type UserToReturn = {
    name: string;
    email: string;
    trips: Array<{
        id: string;
        startedAt: string;
        endedAt: string | null;
        scooterId: string;
    }>;
    invoices: Array<{
        id: string;
        amount: string;
        paid: boolean;
        paidAt: string | null;
        currency: string;
        createdAt: string;
    }>;
};

export class UserInfoGQL {
    public static userInfoType = new GraphQLObjectType({
        name: 'UserInfo',
        fields: {
            name: { type: new GraphQLNonNull(GraphQLString) },
            email: { type: new GraphQLNonNull(GraphQLString) },
            trips: {
                type: new GraphQLNonNull(new GraphQLList(new GraphQLObjectType({
                    name: 'Trip',
                    fields: {
                        id: { type: new GraphQLNonNull(GraphQLString) },
                        startedAt: { type: new GraphQLNonNull(GraphQLString) },
                        endedAt: { type: GraphQLString },
                        scooterId: { type: new GraphQLNonNull(GraphQLString) },
                    },
                }))),
            },
            invoices: {
                type: new GraphQLNonNull(new GraphQLList(new GraphQLObjectType({
                    name: 'Invoice',
                    fields: {
                        id: { type: new GraphQLNonNull(GraphQLString) },
                        amount: { type: new GraphQLNonNull(GraphQLString) },
                        paid: { type: new GraphQLNonNull(GraphQLString) },
                        paidAt: { type: GraphQLString },
                        currency: { type: new GraphQLNonNull(GraphQLString) },
                        paymentId: { type: GraphQLString },
                        createdAt: { type: new GraphQLNonNull(GraphQLString) },
                    },
                }))),
            },
        },
    });

    public static async getUserInfo(jwt: string): Promise<UserToReturn> {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not set');
        }

        let jwtPayload = verify(jwt, JWT_SECRET);

        if (typeof jwtPayload !== 'object') {
            throw new Error('Invalid JWT payload');
        }

        const user = await User.findOne({
            where: {
                id: jwtPayload['id'],
            }
        });
        if (!user) {
            throw new Error('User not found from JWT');
        }

        const trips = await user.getTrips();
        const invoices = await user.getInvoices();

        return {
            name: user.name,
            email: user.email,
            trips: trips.map(trip => ({
                id: trip.id,
                startedAt: trip.startedAt.toISOString(),
                endedAt: trip.endedAt ? trip.endedAt.toISOString() : null,
                scooterId: trip.scooterId,
            })),
            invoices: invoices.map(invoice => ({
                id: invoice.id,
                amount: invoice.amount.toString(),
                paid: invoice.paid,
                paidAt: invoice.paidAt ? invoice.paidAt.toISOString() : null,
                currency: invoice.currency,
                createdAt: invoice.createdAt.toISOString(),
            })),
        }
    }
}
