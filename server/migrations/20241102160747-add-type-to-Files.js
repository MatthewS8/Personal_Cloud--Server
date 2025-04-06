"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the database exists
    const databaseExists = await queryInterface.sequelize.query(
      "SELECT datname FROM pg_database WHERE datname = 'your_database_name';"
    );

    if (databaseExists[0].length > 0) {
      const columnExists = await queryInterface.sequelize.query(
        "SELECT * FROM information_schema.columns WHERE table_name='Files' AND column_name='type';"
      );
      if (columnExists[0].length === 0) {
        await queryInterface.addColumn("Files", "type", {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "image/jpeg",
        });
      }
    }
  },
  

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Files", "type");
  },
};
