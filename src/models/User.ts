import { Association, CreationOptional, DataTypes, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin, HasManySetAssociationsMixin, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "../lib/Database";
import Invoice from "./Invoice";
import { sign, SignOptions } from "jsonwebtoken";
import Trip from "./Trip";

const JWT_SECRET = process.env.JWT_SECRET ?? "Default_Secret_Please_Change_In_.env";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1h";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<string>;
    declare email: string;
    declare name: string;
    declare idp_id: string;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare getInvoices: HasManyGetAssociationsMixin<Invoice>;
    declare addInvoice: HasManyAddAssociationMixin<Invoice, string>;
    declare addInvoices: HasManyAddAssociationsMixin<Invoice, string>;
    declare setInvoices: HasManySetAssociationsMixin<Invoice, string>;
    declare removeInvoice: HasManyRemoveAssociationMixin<Invoice, string>;
    declare removeInvoices: HasManyRemoveAssociationsMixin<Invoice, string>;
    declare hasInvoice: HasManyHasAssociationMixin<Invoice, string>;
    declare hasInvoices: HasManyHasAssociationsMixin<Invoice, string>;
    declare countInvoices: HasManyCountAssociationsMixin;
    declare createInvoice: HasManyCreateAssociationMixin<Invoice, 'userId'>;

    declare getTrips: HasManyGetAssociationsMixin<Trip>;
    declare addTrip: HasManyAddAssociationMixin<Trip, string>;
    declare addTrips: HasManyAddAssociationsMixin<Trip, string>;
    declare setTrips: HasManySetAssociationsMixin<Trip, string>;
    declare removeTrip: HasManyRemoveAssociationMixin<Trip, string>;
    declare removeTrips: HasManyRemoveAssociationsMixin<Trip, string>;
    declare hasTrip: HasManyHasAssociationMixin<Trip, string>;
    declare hasTrips: HasManyHasAssociationsMixin<Trip, string>;
    declare countTrips: HasManyCountAssociationsMixin;
    declare createTrip: HasManyCreateAssociationMixin<Trip, 'userId'>;

    declare invoices?: NonAttribute<Invoice[]>;
    declare trips?: NonAttribute<Trip[]>;

    declare static associations: {
        invoices: Association<User, Invoice>;
        trips: Association<User, Trip>;
    }

    public static defineAssociations(): void {
        User.hasMany(Invoice, {
            as: 'invoices',
            foreignKey: 'userId'
        });
        User.hasMany(Trip, {
            as: 'trips',
            foreignKey: 'userId'
        });
    }

    public async getActiveTrip(): Promise<Trip | null> {
        const trips = await this.getTrips({
            where: {
                endedAt: null
            },
            limit: 1
        });
        return trips.length > 0 ? trips[0] : null;
    }

    public generateJWT(): string {
        return sign(this.toJSON(), JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        } as SignOptions);
    }
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        idp_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: 'User'
    }
);

export default User;
