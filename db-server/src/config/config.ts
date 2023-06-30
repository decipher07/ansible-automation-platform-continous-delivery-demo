import dotenv from 'dotenv';

dotenv.config();

const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 3000;

const PGUSER=process.env.PGUSER || 'postgres';
const PGHOST=process.env.PGHOST || 'localhost';
const PGPASSWORD=process.env.PGPASSWORD || 'password';
const PGDATABASE=process.env.PGDATABASE || 'postgres';
const PGPORT=process.env.PGPORT ? Number(process.env.PGPORT) : 5432;

export const config = {
    server: {
        port: SERVER_PORT
    },
    postgres: {
        username: PGUSER,
        hostname: PGHOST,
        password: PGPASSWORD,
        database: PGDATABASE,
        port: PGPORT
    }
};