'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const existingUser = await queryInterface.rawSelect('Users', {
        where: {
          username: 'admin'
        }
      }, ['userID']);
      if (!existingUser) {
        await queryInterface.bulkInsert('Users', [{
          username: 'admin',
          password: '$2a$10$4LaGgDNKGApGGhhB.qwVJuqY.Lom8Q5JH4OIWDYJd0/lJ707KKi3m',
          role: 'admin'
        }], {});
        console.log('Admin user created.');
      } else {
        console.log('Admin user already exists.');
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('Users', {
        username: 'admin'
      }, {});
      console.log('Admin user deleted.');
    } catch (error) {
      console.error('Error deleting admin user:', error);
    }
  }
};
