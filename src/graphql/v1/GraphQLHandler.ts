import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { createHandler } from 'graphql-http/lib/use/express';

import { UserInfoGQL } from './UserInfoGQL';
import { ScooterInfoGQL } from './ScooterInfoGQL';
import { ChargingStationGQL } from './ChargingStationGQL';

export class GraphQLHandler_V1 {
    public static globalInput = {
        token: {
            type: GraphQLString,
        },
    }

    public static schema = new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'Query',
            fields: {
                userInfo: {
                    type: UserInfoGQL.userInfoType,
                    resolve: async (_, __, context) => {
                        return await UserInfoGQL.getUserInfo(context.token);
                    }
                },
                scooters: {
                    type: new GraphQLList(ScooterInfoGQL.scooterInfoType),
                    args: {
                        id: { type: GraphQLString },
                    },
                    resolve: (_, args) => {
                        return ScooterInfoGQL.getScooterInfo(args.id);
                    },
                },
                chargingStations: {
                    type: new GraphQLList(ChargingStationGQL.chargingStationType),
                    args: {
                        id: { type: GraphQLString },
                    },
                    resolve: (_, args) => {
                        return ChargingStationGQL.getChargingStation(args.id);
                    },
                },
            },
        }),
        mutation: new GraphQLObjectType({
            name: 'Mutation',
            fields: {
                scooter: {
                    type: ScooterInfoGQL.scooterInfoType,
                    args: {
                        id: { type: new GraphQLNonNull(GraphQLString) },
                        status: { type: new GraphQLNonNull(ScooterInfoGQL.scooterStatusEnum) },
                    },
                    resolve: (_, args) => {
                        return ScooterInfoGQL.updateScooter(args.id, args.status);
                    },
                }
            },
        }),
    });

    public static handler = createHandler({
        schema: GraphQLHandler_V1.schema,
        context: (req) => {
            let token = (req.headers as any)['authorization'] || "";
            if (token && token.startsWith('Bearer ')) {
                token = token.slice(7, token.length);
            }
            return {
                token,
            };
        }
    });
}
