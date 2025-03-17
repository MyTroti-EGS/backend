import { GraphQLObjectType, GraphQLString } from 'graphql';
import User from '../../models/User';
import { verify } from 'jsonwebtoken';

export class UserInfoGQL {
    public static userInfoType = new GraphQLObjectType({
        name: 'UserInfo',
        fields: {
            name: { type: GraphQLString },
            email: { type: GraphQLString },
        },
    });

    public static async getUserInfo(jwt: string) {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not set');
        }

        let jwtPayload = verify(jwt, JWT_SECRET);

        if (typeof jwtPayload !== 'object') {
            throw new Error('Invalid JWT payload');
        }

        const user = await User
            .findOne({
                where: {
                    id: jwtPayload['id'],
                }
            })
            .then((user) => user?.toJSON());

        return user;
    }
}
