const { body, param, validationResult } = require('express-validator');

// Common validation chains
const commonValidations = {
    name: body('name')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .escape()
        .withMessage('Name must be less than 50 characters'),
    
    comment: body('comment')
        .trim()
        .notEmpty()
        .isLength({ max: 2000 })
        .escape()
        .withMessage('Comment is required and must be less than 2000 characters'),
    
    subject: body('subject')
        .trim()
        .notEmpty()
        .isLength({ max: 150 })
        .escape()
        .withMessage('Subject is required and must be less than 150 characters'),
    
    boardSlug: param('slug')
        .trim()
        .notEmpty()
        .isLength({ max: 10 })
        .matches(/^[a-z0-9]+$/)
        .withMessage('Invalid board slug'),
    
    threadId: param('thread_id')
        .trim()
        .notEmpty()
        .isInt()
        .withMessage('Invalid thread ID')
};

// Validation middleware for creating a new thread
const validateNewThread = [
    commonValidations.name,
    commonValidations.subject,
    commonValidations.comment,
    commonValidations.boardSlug
];

// Validation middleware for creating a new comment
const validateNewComment = [
    commonValidations.name,
    commonValidations.comment,
    commonValidations.boardSlug,
    commonValidations.threadId
];

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

// Content moderation - check for banned words/patterns
const moderateContent = (text) => {
    const bannedPatterns = [
        /\b(viagra|cialis)\b/i,  // Spam keywords
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email addresses
        /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
        /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})\b/, // Credit card numbers
    ];

    return !bannedPatterns.some(pattern => pattern.test(text));
};

// File validation
const validateFile = (file) => {
    if (!file) return true;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (file.size > maxSize) {
        throw new Error('File size exceeds 5MB limit');
    }
    
    if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed');
    }

    return true;
};

module.exports = {
    validateNewThread,
    validateNewComment,
    handleValidationErrors,
    moderateContent,
    validateFile
};
