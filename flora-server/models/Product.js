import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ['Verified', 'Needs Review', 'Rejected'],
            default: 'Needs Review'
        },

        brand: {
            type: String,
            trim: true
        },

        category: {
            type: String,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        ingredients: {
            type: [String],
            default: []
        },

        nutrition: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        sourceFile: {
            type: String,
            trim: true
        },

        sourceFileType: {
            type: String,
            trim: true
        },

        extractedData: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        /**
         * Ownership association.
         * null = legacy product created before authentication was introduced.
         * Admins can see all products including legacy.
         * Normal users can only see products where uploadedBy === their own userId.
         */
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },

        /**
         * True for products created before authentication was introduced.
         * Prevents legacy products from being randomly assigned to authenticated users.
         */
        isLegacy: {
            type: Boolean,
            default: false
        },
        intelligence: {
            normalization: { type: mongoose.Schema.Types.Mixed },
            classification: { type: mongoose.Schema.Types.Mixed },
            quality: { type: mongoose.Schema.Types.Mixed },
            similarity: { type: mongoose.Schema.Types.Mixed }
        }
    },
    {
        timestamps: true
    }
);

// Index for fast user-scoped queries
productSchema.index({ uploadedBy: 1, createdAt: -1 });
productSchema.index({ isLegacy: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
