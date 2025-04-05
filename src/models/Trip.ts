import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "../lib/Database";
import User from "./User";

class Trip extends Model<InferAttributes<Trip>, InferCreationAttributes<Trip>> {
    declare id: CreationOptional<string>;
    declare startedAt: Date;
    declare endedAt: CreationOptional<Date> | null;
    declare scooterId: string;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare userId: ForeignKey<User['id']>;
    declare user?: NonAttribute<User>;

    public static defineAssociations(): void {
        Trip.belongsTo(User, {
            as: 'user',
            foreignKey: 'userId'
        });
    }
}

Trip.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        startedAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        endedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        scooterId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: 'Trip',
        tableName: 'trips',
    }
);

export default Trip;
