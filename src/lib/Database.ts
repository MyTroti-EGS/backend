import { Sequelize } from "sequelize";
import Logger from "./Logger";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const logger = ['true', '1'].includes(process.env.DATABASE_LOGGING ?? 'false')
  ? (msg: string) => Logger.createSubLogger('sequelize').info(msg)
  : false;

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: logger,
});
