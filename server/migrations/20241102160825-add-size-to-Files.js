"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columnExists = await queryInterface.sequelize.query(
      "SELECT * FROM information_schema.columns WHERE table_name='Files' AND column_name='size';"
    );
    if (columnExists[0].length === 0) {
      await queryInterface.addColumn("Files", "size", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Files", "size");
  },
};
