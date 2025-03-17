import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

export class LocationGQL {
    public static locationType = new GraphQLObjectType({
        name: 'Location',
        fields: {
            latitude: { type: new GraphQLNonNull(GraphQLString) },
            longitude: { type: new GraphQLNonNull(GraphQLString) },
        },
    });
}
