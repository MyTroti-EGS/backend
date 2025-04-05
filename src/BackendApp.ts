import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import Logger from './lib/Logger';
import { readDirRecursiveSync } from './lib/Utils';
import Route from './lib/Route';
import ExpressLogger from './lib/ExpressLogger';
import { sequelize } from './lib/Database';
import { GraphQLHandler_V1 } from './graphql/v1/GraphQLHandler';
import Invoice from './models/Invoice';
import User from './models/User';
import SwaggerUI from 'swagger-ui-express';
import { readFileSync } from 'fs';
import Trip from './models/Trip';

export default class BackendApp {
    private app: express.Application;

    private routes: Map<string, Route> = new Map();

    public logger = Logger.createSubLogger('app');

    constructor() {
        this.app = express();
        this.app.use(cors());
        this.app.use(cookieParser());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        if (['true', '1'].includes(process.env.HTTP_LOGGING?.toLocaleLowerCase() || ''))
            this.app.use((req, res, next) => ExpressLogger(this, req, res, next));

        this.app.use('/docs/rest', SwaggerUI.serve, SwaggerUI.setup(
            JSON.parse(
                readFileSync(
                    join(__dirname, '..', 'api', 'swagger.json'),
                    'utf-8'
                )
            )
        ));

        this.init().then(() => this.logger.info('Backend initialized'));
    }

    async init() {
        await this.initDatabase();
        await this.initRoutes();
    }

    async initDatabase() {
        const databaseLogger = this.logger.createSubLogger('database');
        databaseLogger.info('Connecting to database...');
        try {
            await sequelize.authenticate();
            databaseLogger.info('Connection to the database has been established successfully.');
        } catch (error: any) {
            databaseLogger.error('Unable to connect to the database');
            databaseLogger.error(error);
            process.exit(1);
        }

        const classes = [Invoice, User, Trip];
        for (const model of classes) {
            const recreate = process.env.FORCE_DB_RECREATION === 'true';
            await model.sync({ force: recreate });
            if (recreate) databaseLogger.warn(`MODEL ${model.name} RECREATED`);
            databaseLogger.info(`Model ${model.name} synchronized`);
        }

        for (const model of classes) {
            if ('defineAssociations' in model) {
                model.defineAssociations();
                databaseLogger.info(`Associations for model ${model.name} created`);
            }
        }

        databaseLogger.info('Database synchronized');
    }

    async initRoutes() {
        const routesLogger = this.logger.createSubLogger('routes');
        const routes = readDirRecursiveSync(join(__dirname, 'routes'));
        routesLogger.debug(`Found ${routes.length} routes`);
        for (const route of routes) {
            routesLogger.debug(`Loading route ${route}`);
            const loaded = await import(route);
            const loadedRoute = 'default' in loaded ? loaded.default : undefined;
            if (!loadedRoute) {
                routesLogger.error(`Route ${route} does not export a default class`);
                continue;
            }
            const routeInstance: Route = new loadedRoute(this, this.app);
            this.routes.set(routeInstance.name, routeInstance);
            routesLogger.info(`Route ${routeInstance.name} loaded on path ${routeInstance.path}`);
        }

        routesLogger.info('Loading GraphQL handler');
        this.app.use('/graphql/v1', GraphQLHandler_V1.handler);
    }

    listen(port: number) {
        this.app.listen(port, () => {
            this.logger.info(`Backend listening on port ${port}`);
        });
    }

    gracefullyStop() {
        console.log('\rBackend shutting down');
        process.exit(0);
    }
}
