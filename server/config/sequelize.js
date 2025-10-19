const { Sequelize } = require("sequelize");
const config = require("./config.js")[process.env.NODE_ENV || "development"];

console.log("Creating sequelize instance");
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  }
);
// // Umzug setup for migrations and seeders
// const umzugMigrations = new Umzug({
//   migrations: {
//     glob: 'migrations/*.js',
//   },
//   storage: new SequelizeStorage({ sequelize }),
//   context: sequelize.getQueryInterface(),
//   logger: console,
// });

// const umzugSeeders = new Umzug({
//   migrations: {
//     glob: 'seeders/*.js',
//   },
//   storage: new SequelizeStorage({ sequelize, tableName: 'SequelizeData' }),
//   context: sequelize.getQueryInterface(),
//   logger: console,
// });

// // Function to run migrations and seeders
// async function runMigrationsAndSeeders() {
//   try {
//     await sequelize.authenticate();
//     console.log('Database connected successfully.');

//     await umzugMigrations.up();
//     console.log('Migrations applied successfully.');

//     await umzugSeeders.up();
//     console.log('Seeders applied successfully.');

//   } catch (err) {
//     console.error('Error during migration/seed:', err);
//     process.exit(1);
//   }
// }

module.exports = sequelize;
