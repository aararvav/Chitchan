const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

class FileService {
    constructor() {
        this.storage = multer.diskStorage({
            destination: async (req, file, cb) => {
                const uploadDir = 'public/uploads';
                try {
                    await fs.mkdir(uploadDir, { recursive: true });
                    cb(null, uploadDir);
                } catch (error) {
                    cb(error);
                }
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = crypto.randomBytes(16).toString('hex');
                cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
            }
        });

        this.upload = multer({
            storage: this.storage,
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB
            },
            fileFilter: (req, file, cb) => {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/webm', 'video/mp4'];
                if (allowedTypes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error('Invalid file type'));
                }
            }
        });
    }

    async deleteFile(filename) {
        try {
            await fs.unlink(path.join('public/uploads', filename));
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }

    getFileUrl(filename) {
        return `/uploads/${filename}`;
    }

    validateFile(file) {
        if (!file) return { valid: true };
        
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/webm', 'video/mp4'];
        
        if (file.size > maxSize) {
            return { valid: false, error: 'File too large' };
        }
        
        if (!allowedTypes.includes(file.mimetype)) {
            return { valid: false, error: 'Invalid file type' };
        }
        
        return { valid: true };
    }
}

module.exports = new FileService(); 