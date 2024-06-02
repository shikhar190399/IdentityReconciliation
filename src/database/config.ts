import { Dialect } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const config = {
    development: {
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        dialect: process.env.DATABASE_DIALECT as Dialect,
        dialectOptions: {
            bigNumberStrings: true
        }
    }
};

export default config;