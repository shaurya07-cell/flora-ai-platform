import fs from 'fs/promises';
import Product from '../models/Product.js';
import { runOcr } from '../services/ocr/ocrRunner.js';
import { processProductDocument } from '../services/ai/productIntelligencePipeline.js';

/**
 * Controller to handle document upload, OCR parsing, AI extraction, validation, and database persistence.
 */
export const uploadProduct = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FILE',
        message: 'No file uploaded. Please upload a document using the "file" field.'
      }
    });
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;

  try {
    // 1. Run Python OCR Bridge
    const ocrResult = await runOcr(filePath);

    // 2. Run Gemini AI Product Intelligence Pipeline (extraction, normalization, and validation)
    const validationResult = await processProductDocument(ocrResult.cleanText);

    // 3. Clean up the uploaded temporary file
    try {
      await fs.unlink(filePath);
    } catch (unlinkErr) {
      console.error(`Failed to delete temporary file ${filePath}:`, unlinkErr.message);
    }

    // 4. Do not persist invalid data if validation fails (e.g. schema/Level A errors)
    if (!validationResult.isValid && validationResult.errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Product document validation failed',
          details: {
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            confidence: validationResult.confidence
          }
        }
      });
    }

    // 5. Persist to MongoDB using the Product model
    const product = new Product({
      name: validationResult.cleanedData.productName || 'Unknown Product',
      brand: validationResult.cleanedData.brand || '',
      description: validationResult.cleanedData.description || '',
      sourceFile: fileName,
      sourceFileType: ocrResult.fileType,
      extractedData: {
        sku: validationResult.cleanedData.sku,
        price: validationResult.cleanedData.price,
        currency: validationResult.cleanedData.currency,
        dimensions: validationResult.cleanedData.dimensions,
        specifications: validationResult.cleanedData.specifications,
        complianceFlags: validationResult.cleanedData.complianceFlags,
        validation: {
          isValid: validationResult.isValid,
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          confidence: validationResult.confidence
        }
      }
    });

    await product.save();

    // 6. Return standard successful response
    return res.status(201).json({
      success: true,
      data: {
        product,
        document: {
          fileName,
          fileType: ocrResult.fileType
        },
        ocr: {
          cleanText: ocrResult.cleanText,
          tables: ocrResult.tables,
          metadata: ocrResult.metadata
        },
        validation: {
          isValid: validationResult.isValid,
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          confidence: validationResult.confidence
        }
      }
    });

  } catch (err) {
    // Ensure cleanup of the uploaded temporary file on any error
    try {
      await fs.unlink(filePath);
    } catch (_) {}

    // Special handling for unsupported file type errors from OCR
    if (err.message.includes('Unsupported file format') || err.message.includes('unsupported') || err.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'UNSUPPORTED_FILE_TYPE',
          message: err.message
        }
      });
    }

    // Forward to the central Express error handler
    next(err);
  }
};

/**
 * Retrieve all persisted products.
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve a single product by ID.
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID ${req.params.id} could not be found`
        }
      });
    }
    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update product information manually (override).
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID ${req.params.id} could not be found`
        }
      });
    }
    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a product.
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID ${req.params.id} could not be found`
        }
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
