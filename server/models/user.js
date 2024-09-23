const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const User = sequelize.define('User', {
    userID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});


// Synchronize the User model with the database
// User.sync({ force: false }) // Set force to true if you want to drop and recreate the table on every startup
//     .then(() => {
//         console.log('User table has been synchronized');
//     })
//     .catch(error => {
//         console.error('Unable to synchronize the User table:', error);
//     });

module.exports = User;
