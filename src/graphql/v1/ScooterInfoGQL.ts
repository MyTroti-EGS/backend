import { GraphQLEnumType, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { LocationGQL } from './common/types/LocationGQL';

const SCOOTER_MONITOR_URL = process.env.SCOOTER_MONITOR_URL;
const SCOOTER_MONITOR_API_KEY = process.env.SCOOTER_MONITOR_API_KEY;

enum ScooterStatus {
    AVAILABLE = 'AVAILABLE',
    OCCUPIED = 'OCCUPIED',
    MAINTENANCE = 'MAINTENANCE',
    CHARGING = 'CHARGING',
}

type ScooterInfo = {
    id: number,
    latitude: number,
    longitude: number,
    battery_percentage: string,
    mac_address: string,
    serial_number: string,
    status: ScooterStatus,
}

export class ScooterInfoGQL {
    public static scooterInfoType = new GraphQLObjectType({
        name: 'ScooterInfo',
        fields: {
            id: { type: new GraphQLNonNull(GraphQLString) },
            location: { type: LocationGQL.locationType },
            battery: { type: new GraphQLNonNull(GraphQLString) },
            mac_address: { type: new GraphQLNonNull(GraphQLString) },
            serial_number: { type: new GraphQLNonNull(GraphQLString) },
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
        }).catch((error) => {
            throw new Error(`Failed to fetch scooter info: Server is down`);
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch scooter info: ${response.statusText}`);
        }

        const json = id ? 
            [ await response.json() ]:
            await response.json();

        return json.map((scooter: ScooterInfo) => {
            return {
                id: scooter.id,
                location: { latitude: scooter.latitude, longitude: scooter.longitude },
                battery: scooter.battery_percentage,
                mac_address: scooter.mac_address,
                serial_number: scooter.serial_number,
                status: scooter.status,
            };
        });
    }
}
