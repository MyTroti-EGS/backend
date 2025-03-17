import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "../lib/Database";
import User from "./User";

class Invoice extends Model<InferAttributes<Invoice>, InferCreationAttributes<Invoice>> {
    declare id: CreationOptional<string>;
    declare amount: number;
    declare paid: boolean;
    declare paidAt: Date | null;
    declare items: any;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare userId: ForeignKey<User['id']>;
    declare user?: NonAttribute<User>;

    public async markAsPaid(): Promise<void> {
        this.paid = true;
        this.paidAt = new Date();
        await this.save();
    }

    public static defineAssociations(): void {
        Invoice.belongsTo(User, {
            as: 'user',
            foreignKey: 'userId'
        });
    }
}

Invoice.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        amount: {
            type: new DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        paid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        paidAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        items: {
            type: DataTypes.JSON,
            allowNull: false
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: 'Invoice'
    }
);

export default Invoice;
