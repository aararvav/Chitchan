const { Model, DataTypes } = require('sequelize');

class Comments extends Model {
    static initModel(sequelize) {
        return Comments.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            threadId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'threads',
                    key: 'id'
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
            isHidden: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            ipAddress: {
                type: DataTypes.STRING(45),
                allowNull: true
            },
            userAgent: {
                type: DataTypes.STRING(255),
                allowNull: true
            }
        }, {
            sequelize,
            modelName: 'comments',
            timestamps: true,
            indexes: [
                {
                    fields: ['threadId']
                },
                {
                    fields: ['createdAt']
                }
            ]
        });
    }
}

module.exports = Comments;