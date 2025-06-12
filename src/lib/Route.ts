import BackendApp from '../BackendApp';
import { Application, Request, Response, NextFunction } from 'express';

interface RouteOptions {
    name: string;
    path: string;
}

type RouteFunction = (req: Request, res: Response, next: NextFunction) => void;

interface RouteWithMethods {
    get?: RouteFunction;
    post?: RouteFunction;
    put?: RouteFunction;
    patch?: RouteFunction;
    delete?: RouteFunction;

    registerRoutes: () => void;
}

export default class Route implements RouteWithMethods {
    public manager: BackendApp;
    public app: Application;

    public name: string;
    public path: string;

    constructor(manager: BackendApp, app: Application, options: RouteOptions) {
        this.manager = manager;
        this.app = app;

        this.name = options.name;
        this.path = manager.basePath + options.path;

        this.registerRoutes();
    }

    registerRoutes() {
        if ('get' in this) 
            this.app.get(this.path, (this.get as RouteFunction).bind(this));
        if ('post' in this) 
            this.app.post(this.path, (this.post as RouteFunction).bind(this));
        if ('put' in this) 
            this.app.put(this.path, (this.put as RouteFunction).bind(this));
        if ('patch' in this) 
            this.app.patch(this.path, (this.patch as RouteFunction).bind(this));
        if ('delete' in this) 
            this.app.delete(this.path, (this.delete as RouteFunction).bind(this));
    }
}
