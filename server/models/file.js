const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./user');

const File = sequelize.define('File', {
    fileID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ownerId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'userID'
        },
        onDelete: 'CASCADE'
    }
});

// User.hasMany(File, { foreignKey: 'userID', onDelete: 'CASCADE' });
// File.belongsTo(User, { foreignKey: 'userID', onDelete: 'CASCADE' });

module.exports = File;
