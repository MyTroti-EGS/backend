import { GraphQLEnumType, GraphQLObjectType, GraphQLString } from 'graphql';
import { LocationGQL } from './common/types/LocationGQL';

const SCOOTER_MONITOR_URL = process.env.SCOOTER_MONITOR_URL;
const SCOOTER_MONITOR_API_KEY = process.env.SCOOTER_MONITOR_API_KEY;

enum ScooterStatus {
    AVAILABLE = 'available',
    OCCUPIED = 'occupied',
    MAINTENANCE = 'maintenance',
    CHARGING = 'charging',
}

export class ScooterInfoGQL {
    public static scooterInfoType = new GraphQLObjectType({
        name: 'ScooterInfo',
        fields: {
            id: { type: GraphQLString },
            location: { type: LocationGQL.locationType },
            battery: { type: GraphQLString },
            status: { 
                type: new GraphQLEnumType({
                    name: 'ScooterStatus',
                    values: {
                        AVAILABLE: { value: ScooterStatus.AVAILABLE },
                        OCCUPIED: { value: ScooterStatus.OCCUPIED },
                        MAINTENANCE: { value: ScooterStatus.MAINTENANCE },
                        CHARGING: { value: ScooterStatus.CHARGING },
                    }
                }),
            },
        },
    });

    public static async getScooterInfo(id?: string) {
        if (!SCOOTER_MONITOR_URL || !SCOOTER_MONITOR_API_KEY) {
            throw new Error('Missing scooter monitor URL or API key');
        }

        let url = `${SCOOTER_MONITOR_URL}/v1/scooters`;
        if (id) url += `/${id}`;

        const response = await fetch(url, {
            headers: {
                "x-api-key": SCOOTER_MONITOR_API_KEY,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch scooter info: ${response.statusText}`);
        }

        const json = await response.json();

        if (id) return [ json ];
        return json;
    }
}
