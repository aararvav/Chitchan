const sequelize = require("../config/index").getSequelize();
const { Model, DataTypes } = require('sequelize');

class Threads extends Model {}

Threads.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    boardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'boards',
            key: 'id'
        }
    },
    subject: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 150]
        }
    },
    author: {
        type: DataTypes.STRING(150),
        allowNull: false,
        defaultValue: 'Anonymous',
        validate: {
            len: [1, 150]
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    file: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    isSticky: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isLocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lastBump: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'threads',
    timestamps: true,
    indexes: [
        {
            fields: ['boardId']
        },
        {
            fields: ['lastBump']
        }
    ]
});

module.exports = Threads;
