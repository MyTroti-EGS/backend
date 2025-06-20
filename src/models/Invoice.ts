import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "../lib/Database";
import User from "./User";

class Invoice extends Model<InferAttributes<Invoice>, InferCreationAttributes<Invoice>> {
    declare id: CreationOptional<string>;
    declare amount: number;
    declare paid: CreationOptional<boolean>;
    declare paidAt: CreationOptional<Date> | null;
    declare items: any;
    declare currency: string;
    declare paymentId: CreationOptional<string> | null;

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
        userId: {
            type: DataTypes.UUID,
            allowNull: false
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
        currency: {
            type: DataTypes.STRING,
            allowNull: false
        },
        paymentId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: 'Invoice',
        tableName: 'invoices',
    }
);

export default Invoice;
