const { Model, DataTypes } = require('sequelize');
const sequelize = require("../config/index").getSequelize();

class Boards extends Model {}

Boards.init({
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(150),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'boards',
    tableName: 'boards'
});

// Don't sync here - let the app.js handle syncing
module.exports = Boards;
