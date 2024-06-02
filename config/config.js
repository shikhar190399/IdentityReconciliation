require('dotenv').config({
  path: '.env'
});

module.exports = {
  development: {
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      host: process.env.DATABASE_HOST,
      dialect: process.env.DATABASE_DIALECT,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // You can set this to true if you have the proper certificate
        }
      }
  },
  test: {
      username: 'root',
      password: null,
      database: 'database_test',
      host: '127.0.0.1',
      dialect: 'mysql'
  },
  production: {
      username: 'root',
      password: null,
      database: 'database_production',
      host: '127.0.0.1',
      dialect: 'mysql'
  }
};