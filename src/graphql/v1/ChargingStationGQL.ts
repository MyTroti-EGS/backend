import { GraphQLObjectType, GraphQLString } from 'graphql';
import { LocationGQL } from './common/types/LocationGQL';

const POI_URL = process.env.POI_URL;
const POI_API_KEY = process.env.POI_API_KEY;

type Point = {
    id: string;
    latitude: number;
    longitude: number;
    metadata: Record<string, any>;
}

export class ChargingStationGQL {
    public static chargingStationType = new GraphQLObjectType({
        name: 'ChargingStation',
        fields: {
            id: { type: GraphQLString },
            location: { type: LocationGQL.locationType },
            metadata: { type: GraphQLString },
        },
    });

    public static async getChargingStation(id?: string) {
        if (!POI_URL || !POI_API_KEY) {
            throw new Error('POI_URL or POI_API_KEY is not set');
        }
        
        let url = `${POI_URL}/v1/poi`;
        if (id) url += `/${id}`;

        const response = await fetch(url, {
            headers: {
                'X-API-Key': POI_API_KEY,
            },
        }).catch((error) => {
            throw new Error(`Failed to fetch charging station: Server is down`);
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch charging station: ${response.statusText}`);
        }

        let data: Point[];
        if (id) {
            data = [await response.json()];
        } else {
            data = await response.json();
        }

        return data.map((point) => ({
            id: point.id,
            location: {
                latitude: point.latitude,
                longitude: point.longitude,
            },
            metadata: JSON.stringify(point.metadata),
        }));
    }
}
