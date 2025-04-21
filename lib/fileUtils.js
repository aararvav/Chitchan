const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images are allowed.'));
        }
    }
});

// Process uploaded image and create thumbnail
async function processImage(filePath) {
    try {
        const info = await sharp(filePath).metadata();
        const thumbnailPath = filePath.replace(/\.[^.]+$/, '_thumb$&');
        
        // Create thumbnail (max 200x200)
        await sharp(filePath)
            .resize(200, 200, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toFile(thumbnailPath);

        return {
            width: info.width,
            height: info.height,
            size: info.size,
            thumbnail: path.basename(thumbnailPath)
        };
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}

module.exports = {
    upload,
    processImage
}; 