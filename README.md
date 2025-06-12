# EGS-Backend - MyTroti Backend

This is the backend for the MyTroti project. It uses GraphQL as well as RESTful APIs to interact with the multiple services that are part of the project.

## Dependencies

- [Node.js](https://nodejs.org/en/)
- [NPM](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/)

For Docker:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Running the code

### Environment Variables

The application uses several environment variables for configuration. Copy `.env.example` to `.env` and adjust the values as needed.

Key variables include:

- `BASE_PATH`: Optional base path for all API routes (e.g., `/api` would make routes available at `/api/v1/...`)
- `PORT`: Port number for the server (default: 5000)
- `DATABASE_URL`: PostgreSQL connection string
- `BASE_URL`: Base URL for the application (used for redirects)

### Production

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in the required values
3. Run `run.sh` script

### Development

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in the required values
3. Run `npm install`
4. Run `npm run build`
5. Run `npm start`
