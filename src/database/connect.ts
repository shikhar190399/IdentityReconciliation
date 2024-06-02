import Sql from 'sequelize';
import database from './config';

const NAMESPACE = 'DATABASE CONNECTION';

const db: any = {};
const connect = () => {
    console.info(NAMESPACE, `Attempting to connect Database`);
    try {
        const sql = new Sql.Sequelize(
            database.development.database!,
            database.development.username!,
            database.development.password!,
            {
                host: database.development.host!,
                port: +database.development.port!,
                dialect: database.development.dialect!,
                dialectOptions: {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false 
                    }
                },
                logging: true
            }
        );
        db.sql = sql;
        console.info(NAMESPACE, `Connection has been established successfully.`);
    } catch (error) {
        console.error(NAMESPACE, `Unable to connect to the database:${error}`);
    }
};

export { connect, db }