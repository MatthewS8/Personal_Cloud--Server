"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columnExists = await queryInterface.sequelize.query(
      "SELECT * FROM information_schema.columns WHERE table_name='Users' AND column_name='role';"
    );
    if (columnExists[0].length === 0) {
      await queryInterface.addColumn("Users", "role", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "user",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "role");
  },
};
