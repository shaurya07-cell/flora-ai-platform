import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
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
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model('Product', productSchema);

export default Product;