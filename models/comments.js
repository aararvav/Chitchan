const { Model, DataTypes } = require('sequelize');
const { fileUtils } = require('../lib/fileUtils');

class Comments extends Model {
    static associate(models) {
        this.belongsTo(models.Threads, { foreignKey: 'threadId' });
    }

    static async createWithFile(data, file) {
        if (file) {
            const processedImage = await fileUtils.processImage(file.path);
            data.file = file.filename;
            data.thumbnail = processedImage.thumbnail;
            data.fileSize = processedImage.size;
            data.fileWidth = processedImage.width;
            data.fileHeight = processedImage.height;
        }
        return this.create(data);
    }
}

module.exports = Comments;
