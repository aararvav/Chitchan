const sequelize = require("../config/index").getSequelize();
const { Model, DataTypes } = require('sequelize');

class Boards extends Model {}

Boards.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 100]
        }
    },
    slug: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [1, 50],
            is: /^[a-z0-9]+$/i
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    rules: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isNsfw: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isLocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    maxThreads: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    maxReplies: {
        type: DataTypes.INTEGER,
        defaultValue: 500
    },
    maxFileSize: {
        type: DataTypes.INTEGER,
        defaultValue: 5242880 // 5MB in bytes
    },
    allowedFileTypes: {
        type: DataTypes.STRING(255),
        defaultValue: 'jpg,jpeg,png,gif,webm,mp4'
    },
    bannerUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isUrl: true
        }
    }
}, {
    sequelize,
    modelName: 'boards',
    timestamps: true,
    indexes: [
        {
            fields: ['slug'],
            unique: true
        }
    ]
});

module.exports = Boards;
