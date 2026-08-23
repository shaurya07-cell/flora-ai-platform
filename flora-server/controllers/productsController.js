import fs from 'fs/promises';
import Product from '../models/Product.js';
import { runOcr } from '../services/ocr/ocrRunner.js';
import { processProductDocument } from '../services/ai/productIntelligencePipeline.js';
import { runIntelligence } from '../services/intelligence/intelligenceRunner.js';

/**
 * Build a MongoDB query filter that scopes results to the authenticated user.
 * Admins see ALL products (including legacy null-ownership).
 * Normal users only see their own products (uploadedBy === req.user._id).
 */
const buildOwnershipFilter = (req) => {
  if (req.user && req.user.role === 'admin') {
    return {}; // Admins: no filter restriction
  }
  if (req.user) {
    return { uploadedBy: req.user._id }; // Normal users: own products only
  }
  // Unauthenticated (should not reach here if requireAuth is applied)
  return { uploadedBy: null, isLegacy: false };
};

/**
 * Verify product ownership. Admins can access any product.
 * Normal users can only access products they uploaded.
 * Returns null if access is denied.
 */
const findProductWithOwnership = async (id, req) => {
  const product = await Product.findById(id);
  if (!product) return null;

  if (req.user.role === 'admin') return product;

  // Normal user: must own the product
  if (!product.uploadedBy || String(product.uploadedBy) !== String(req.user._id)) {
    return 'FORBIDDEN';
  }
  return product;
};

/**
 * Controller to handle document upload, OCR parsing, AI extraction, validation, and database persistence.
 * Ownership is derived from req.user — never from request body.
 */
export const uploadProduct = async (req, res, next) => {
  const filesArr = req.files && req.files.length > 0
    ? req.files
    : (req.file ? [req.file] : []);

  if (filesArr.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FILE',
        message: 'No file uploaded. Please upload a document using the "file" or "files" field.'
      }
    });
  }

  // Single file handling (preserves exact contract for existing tests and endpoints)
  if (filesArr.length === 1) {
    const file = filesArr[0];
    const filePath = file.path;
    const fileName = file.originalname;

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
            message: `Product document validation failed: ${validationResult.errors.join(', ')}`,
            details: {
              errors: validationResult.errors,
              warnings: validationResult.warnings,
              confidence: validationResult.confidence
            }
          }
        });
      }

      // 5. Persist to MongoDB using the Product model
      const initialStatus = (validationResult.isValid && (!validationResult.warnings || validationResult.warnings.length === 0))
        ? 'Verified'
        : 'Needs Review';

      const product = new Product({
        name: validationResult.cleanedData.productName || 'Unknown Product',
        status: initialStatus,
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
          cleanText: ocrResult.cleanText,
          validation: {
            isValid: validationResult.isValid,
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            confidence: validationResult.confidence
          }
        },
        uploadedBy: req.user ? req.user._id : null,
        isLegacy: false
      });

      // 5a. Prepare catalog of authorized products for the intelligence engine
      let catalog = [];
      try {
        const ownershipFilter = buildOwnershipFilter(req);
        const catalogProducts = await Product.find(ownershipFilter).lean();
        catalog = catalogProducts.map(p => ({
          id: p._id?.toString(),
          name: p.name,
          brand: p.brand,
          model: p.model || '',
          category: p.category || '',
          specifications: (p.extractedData && p.extractedData.specifications) || {}
        }));
      } catch (e) {
        console.warn('Failed to fetch catalog for intelligence engine, proceeding with empty catalog.', e);
      }

      // 5b. Run Intelligence Engine
      let intelligenceResult = null;
      try {
        const intelRes = await runIntelligence(validationResult.cleanedData, catalog);
        if (intelRes.success) {
          intelligenceResult = intelRes.data;
        } else {
          console.warn('Intelligence engine error:', intelRes.errorCode, intelRes.message);
        }
      } catch (e) {
        console.error('Unexpected error calling intelligence engine:', e);
      }

      if (intelligenceResult) {
        product.intelligence = {
          normalization: intelligenceResult.normalization,
          classification: intelligenceResult.classification,
          quality: intelligenceResult.quality,
          similarity: intelligenceResult.similarity
        };

        // Auto-assign category from AI taxonomy classification
        if (intelligenceResult.classification && intelligenceResult.classification.category) {
          product.category = intelligenceResult.classification.category;
        }

        // Auto-verify status if quality overall score >= 70% and schema is valid
        if (intelligenceResult.quality && typeof intelligenceResult.quality.overall_score === 'number') {
          if (intelligenceResult.quality.overall_score >= 0.70 && validationResult.isValid) {
            product.status = 'Verified';
          }
        }
      }

      await product.save();
      console.log(`[PRODUCT] Saved document id: ${product._id}, name: "${product.name}", uploadedBy: ${product.uploadedBy}, status: ${product.status}, collection: ${Product.collection.name}, database: ${Product.db.name}`);

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
      try {
        await fs.unlink(filePath);
      } catch (_) {}

      if (err.message.includes('Unsupported file format') || err.message.includes('unsupported') || err.message.includes('Invalid file type')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'UNSUPPORTED_FILE_TYPE',
            message: err.message
          }
        });
      }

      return next(err);
    }
  }

  // Multi-file batch upload handling
  const results = [];
  let successfulCount = 0;
  let failedCount = 0;

  for (const file of filesArr) {
    const filePath = file.path;
    const fileName = file.originalname;

    try {
      const ocrResult = await runOcr(filePath);
      const validationResult = await processProductDocument(ocrResult.cleanText);

      try {
        await fs.unlink(filePath);
      } catch (_) {}

      if (!validationResult.isValid && validationResult.errors.length > 0) {
        failedCount++;
        results.push({
          fileName,
          success: false,
          error: 'Document validation failed'
        });
        continue;
      }

      const initialStatus = (validationResult.isValid && (!validationResult.warnings || validationResult.warnings.length === 0))
        ? 'Verified'
        : 'Needs Review';

      const product = new Product({
        name: validationResult.cleanedData.productName || 'Unknown Product',
        status: initialStatus,
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
          cleanText: ocrResult.cleanText,
          validation: {
            isValid: validationResult.isValid,
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            confidence: validationResult.confidence
          }
        },
        uploadedBy: req.user ? req.user._id : null,
        isLegacy: false
      });

      let catalog = [];
      try {
        const ownershipFilter = buildOwnershipFilter(req);
        const catalogProducts = await Product.find(ownershipFilter).lean();
        catalog = catalogProducts.map(p => ({
          id: p._id?.toString(),
          name: p.name,
          brand: p.brand,
          model: p.model || '',
          category: p.category || '',
          specifications: (p.extractedData && p.extractedData.specifications) || {}
        }));
      } catch (_) {}

      try {
        const intelRes = await runIntelligence(validationResult.cleanedData, catalog);
        if (intelRes.success) {
          product.intelligence = {
            normalization: intelRes.data.normalization,
            classification: intelRes.data.classification,
            quality: intelRes.data.quality,
            similarity: intelRes.data.similarity
          };

          if (intelRes.data.classification && intelRes.data.classification.category) {
            product.category = intelRes.data.classification.category;
          }

          if (intelRes.data.quality && typeof intelRes.data.quality.overall_score === 'number') {
            if (intelRes.data.quality.overall_score >= 0.70 && validationResult.isValid) {
              product.status = 'Verified';
            }
          }
        }
      } catch (_) {}

      await product.save();
      successfulCount++;
      results.push({
        fileName,
        success: true,
        productId: product._id,
        product
      });

    } catch (fileErr) {
      try {
        await fs.unlink(filePath);
      } catch (_) {}

      failedCount++;
      results.push({
        fileName,
        success: false,
        error: fileErr.message || 'Processing failed'
      });
    }
  }

  return res.status(200).json({
    success: true,
    message: `Batch processing complete. ${successfulCount} succeeded, ${failedCount} failed.`,
    data: {
      total: filesArr.length,
      successfulCount,
      failedCount,
      results
    }
  });
};

/**
 * Retrieve products scoped to the authenticated user (or all for admin).
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const filter = buildOwnershipFilter(req);
    const { page, limit } = req.query;

    if (page || limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [products, total] = await Promise.all([
        Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        Product.countDocuments(filter)
      ]);

      return res.status(200).json({
        success: true,
        data: products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve a single product by ID with ownership enforcement.
 */
export const getProductById = async (req, res, next) => {
  try {
    const result = await findProductWithOwnership(req.params.id, req);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID ${req.params.id} could not be found`
        }
      });
    }
    if (result === 'FORBIDDEN') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied. You do not own this product.'
        }
      });
    }
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update product information manually (override) with ownership enforcement.
 */
export const updateProduct = async (req, res, next) => {
  try {
    const result = await findProductWithOwnership(req.params.id, req);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: { code: 'PRODUCT_NOT_FOUND', message: `Product with ID ${req.params.id} could not be found` }
      });
    }
    if (result === 'FORBIDDEN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied. You do not own this product.' }
      });
    }

    // Prevent spoofing ownership via request body
    const { uploadedBy, isLegacy, ...safeBody } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: safeBody },
      { new: true, runValidators: true }
    );
    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a product with ownership enforcement.
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const result = await findProductWithOwnership(req.params.id, req);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: { code: 'PRODUCT_NOT_FOUND', message: `Product with ID ${req.params.id} could not be found` }
      });
    }
    if (result === 'FORBIDDEN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied. You do not own this product.' }
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve real aggregate stats for dashboard.
 * Scoped to the authenticated user (or global for admin).
 */
export const getProductsStats = async (req, res, next) => {
  try {
    const filter = buildOwnershipFilter(req);

    const totalProducts = await Product.countDocuments(filter);

    if (totalProducts === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalProducts: 0,
          processedDocuments: 0,
          validatedProducts: 0,
          needsReview: 0,
          failedProducts: 0,
          averageConfidence: 0,
          recentProducts: [],
          validationDistribution: {
            valid: 0,
            warning: 0,
            failed: 0
          }
        }
      });
    }

    const distinctDocs = await Product.distinct('sourceFile', filter);
    const processedDocuments = distinctDocs.filter(Boolean).length;

    const validatedProducts = await Product.countDocuments({
      ...filter,
      'extractedData.validation.isValid': true,
      $or: [
        { 'extractedData.validation.warnings': { $size: 0 } },
        { 'extractedData.validation.warnings': { $exists: false } }
      ]
    });

    const needsReview = await Product.countDocuments({
      ...filter,
      $or: [
        { 'extractedData.validation.isValid': false },
        { 'extractedData.validation.warnings.0': { $exists: true } }
      ]
    });

    const failedProducts = await Product.countDocuments({
      ...filter,
      'extractedData.validation.isValid': false,
      'extractedData.validation.errors.0': { $exists: true }
    });

    const avgResult = await Product.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          avgScore: {
            $avg: {
              $ifNull: ['$extractedData.validation.confidence.score', 0]
            }
          }
        }
      }
    ]);
    const averageConfidence = avgResult[0] ? Math.round(avgResult[0].avgScore) : 0;

    const recentProducts = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        totalProducts,
        processedDocuments,
        validatedProducts,
        needsReview,
        failedProducts,
        averageConfidence,
        recentProducts,
        validationDistribution: {
          valid: validatedProducts,
          warning: needsReview,
          failed: failedProducts
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve products requiring manual operator review.
 * Scoped to the authenticated user (or global for admin).
 */
export const getValidationQueue = async (req, res, next) => {
  try {
    const ownerFilter = buildOwnershipFilter(req);
    const products = await Product.find({
      ...ownerFilter,
      $or: [
        { status: 'Needs Review' },
        { 'extractedData.validation.isValid': false },
        { 'extractedData.validation.warnings.0': { $exists: true } }
      ]
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Approve a product after manual review/edits with ownership enforcement.
 */
export const approveProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, productName, sku, brand, price, currency, dimensions, description, specifications, complianceFlags } = req.body || {};

    const result = await findProductWithOwnership(id, req);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: { code: 'PRODUCT_NOT_FOUND', message: `Product with ID ${id} could not be found` }
      });
    }
    if (result === 'FORBIDDEN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied. You do not own this product.' }
      });
    }

    const product = result;

    // Server-side validation of edited fields
    if (price !== undefined && price !== null && price !== '') {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FIELD',
            message: 'Price must be a positive number'
          }
        });
      }
      if (!product.extractedData) product.extractedData = {};
      product.extractedData.price = numPrice;
    }

    if (name || productName) {
      const finalName = String(name || productName).trim();
      if (!finalName) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FIELD',
            message: 'Product name cannot be empty'
          }
        });
      }
      product.name = finalName;
    }

    if (sku !== undefined) {
      if (!product.extractedData) product.extractedData = {};
      product.extractedData.sku = String(sku).trim();
    }

    if (brand !== undefined) {
      product.brand = String(brand).trim();
    }

    if (currency !== undefined) {
      if (!product.extractedData) product.extractedData = {};
      product.extractedData.currency = String(currency).trim();
    }

    if (dimensions !== undefined) {
      if (!product.extractedData) product.extractedData = {};
      product.extractedData.dimensions = String(dimensions).trim();
    }

    if (description !== undefined) {
      product.description = String(description).trim();
    }

    if (specifications !== undefined && typeof specifications === 'object') {
      if (!product.extractedData) product.extractedData = {};
      product.extractedData.specifications = specifications;
    }

    if (complianceFlags !== undefined && Array.isArray(complianceFlags)) {
      if (!product.extractedData) product.extractedData = {};
      product.extractedData.complianceFlags = complianceFlags;
    }

    product.status = 'Verified';
    if (product.extractedData && product.extractedData.validation) {
      product.extractedData.validation.isValid = true;
      product.extractedData.validation.errors = [];
      product.extractedData.validation.warnings = [];
    }

    product.markModified('extractedData');
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product approved successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Reject a product during manual review with ownership enforcement.
 */
export const rejectProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const result = await findProductWithOwnership(id, req);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: { code: 'PRODUCT_NOT_FOUND', message: `Product with ID ${id} could not be found` }
      });
    }
    if (result === 'FORBIDDEN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied. You do not own this product.' }
      });
    }

    const product = result;
    product.status = 'Rejected';
    if (!product.extractedData) product.extractedData = {};
    product.extractedData.rejectionReason = reason ? String(reason).trim() : 'Manual rejection by operator';

    if (product.extractedData.validation) {
      product.extractedData.validation.isValid = false;
    }

    product.markModified('extractedData');
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product rejected successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retry processing for a failed document product.
 * Re-runs extraction, validation, and intelligence engine.
 */
export const retryProductProcessing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await findProductWithOwnership(id, req);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: { code: 'PRODUCT_NOT_FOUND', message: `Product with ID ${id} could not be found` }
      });
    }
    if (result === 'FORBIDDEN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied. You do not own this product.' }
      });
    }

    const product = result;
    const cleanText = product.extractedData?.cleanText || product.extractedData?.rawText || product.name;

    if (!cleanText || cleanText.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'RETRY_NOT_AVAILABLE',
          message: 'No readable source text is available for this document to retry processing.'
        }
      });
    }

    // 1. Re-run Gemini AI Product Intelligence Pipeline
    const validationResult = await processProductDocument(cleanText);

    if (!validationResult.isValid && validationResult.errors.length > 0) {
      product.status = 'Rejected';
      if (!product.extractedData) product.extractedData = {};
      product.extractedData.validation = {
        isValid: false,
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        confidence: validationResult.confidence
      };
      product.markModified('extractedData');
      await product.save();

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Validation check failed: ' + (validationResult.errors[0]?.message || 'Document does not meet product schema rules.'),
          details: {
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            confidence: validationResult.confidence
          }
        }
      });
    }

    // 2. Prepare user-scoped catalog for Intelligence engine
    let catalog = [];
    try {
      const ownershipFilter = buildOwnershipFilter(req);
      const catalogProducts = await Product.find(ownershipFilter).lean();
      catalog = catalogProducts.map(p => ({
        id: p._id?.toString(),
        name: p.name,
        brand: p.brand,
        model: p.model || (p.extractedData && p.extractedData.sku) || '',
        category: p.category || '',
        specifications: (p.extractedData && p.extractedData.specifications) || {}
      }));
    } catch (e) {
      console.warn('Failed to fetch catalog for retry intelligence engine, proceeding with empty catalog.', e);
    }

    // 3. Re-run Intelligence Engine
    let intelligenceResult = null;
    try {
      const intelRes = await runIntelligence(validationResult.cleanedData, catalog);
      if (intelRes.success) {
        intelligenceResult = intelRes.data;
      }
    } catch (e) {
      console.error('Unexpected error calling intelligence engine during retry:', e);
    }

    // 4. Update Product Document
    const initialStatus = (validationResult.isValid && (!validationResult.warnings || validationResult.warnings.length === 0))
      ? 'Verified'
      : 'Needs Review';

    product.name = validationResult.cleanedData.productName || product.name;
    product.status = initialStatus;
    product.brand = validationResult.cleanedData.brand || product.brand || '';
    product.description = validationResult.cleanedData.description || product.description || '';

    if (!product.extractedData) product.extractedData = {};
    product.extractedData.sku = validationResult.cleanedData.sku || product.extractedData.sku;
    product.extractedData.price = validationResult.cleanedData.price ?? product.extractedData.price;
    product.extractedData.currency = validationResult.cleanedData.currency || product.extractedData.currency;
    product.extractedData.dimensions = validationResult.cleanedData.dimensions || product.extractedData.dimensions;
    product.extractedData.specifications = validationResult.cleanedData.specifications || product.extractedData.specifications;
    product.extractedData.complianceFlags = validationResult.cleanedData.complianceFlags || product.extractedData.complianceFlags;
    product.extractedData.validation = {
      isValid: validationResult.isValid,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      confidence: validationResult.confidence
    };
    product.extractedData.cleanText = cleanText;

    if (intelligenceResult) {
      product.intelligence = {
        normalization: intelligenceResult.normalization,
        classification: intelligenceResult.classification,
        quality: intelligenceResult.quality,
        similarity: intelligenceResult.similarity
      };
    }

    product.markModified('extractedData');
    if (intelligenceResult) product.markModified('intelligence');
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product retry processing completed successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Recalculate Intelligence Engine results for an existing product.
 * Does not modify unrelated product fields.
 */
export const recalculateProductIntelligence = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await findProductWithOwnership(id, req);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: { code: 'PRODUCT_NOT_FOUND', message: `Product with ID ${id} could not be found` }
      });
    }
    if (result === 'FORBIDDEN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied. You do not own this product.' }
      });
    }

    const product = result;

    // Build payload for Python intelligence engine from current saved product
    const productPayload = {
      id: product._id.toString(),
      name: product.name,
      brand: product.brand || '',
      model: (product.extractedData && product.extractedData.sku) || product.name,
      category: product.category || (product.extractedData && product.extractedData.category) || '',
      specifications: (product.extractedData && product.extractedData.specifications) || {}
    };

    // Fetch user-scoped catalog for similarity matching
    let catalog = [];
    try {
      const ownershipFilter = buildOwnershipFilter(req);
      const catalogProducts = await Product.find(ownershipFilter).lean();
      catalog = catalogProducts.map(p => ({
        id: p._id?.toString(),
        name: p.name,
        brand: p.brand,
        model: p.model || (p.extractedData && p.extractedData.sku) || '',
        category: p.category || '',
        specifications: (p.extractedData && p.extractedData.specifications) || {}
      }));
    } catch (e) {
      console.warn('Failed to fetch catalog for intelligence recalculation, proceeding with empty catalog.', e);
    }

    // Call Python intelligence runner
    const intelRes = await runIntelligence(productPayload, catalog);
    if (!intelRes.success) {
      return res.status(500).json({
        success: false,
        error: {
          code: intelRes.errorCode || 'INTELLIGENCE_ENGINE_ERROR',
          message: intelRes.message || 'Intelligence engine failed to calculate results'
        }
      });
    }

    // Update ONLY product.intelligence
    product.intelligence = {
      normalization: intelRes.data.normalization,
      classification: intelRes.data.classification,
      quality: intelRes.data.quality,
      similarity: intelRes.data.similarity
    };

    product.markModified('intelligence');
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Intelligence recalculated successfully',
      data: product.intelligence,
      product
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Export product catalog in JSON or CSV format.
 * Scoped strictly via buildOwnershipFilter to ensure normal users only export their own products.
 */
export const exportProducts = async (req, res, next) => {
  try {
    const filter = buildOwnershipFilter(req);
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    const format = (req.query.format || 'json').toLowerCase();

    if (format === 'csv') {
      const escapeCsv = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const headers = ['ID', 'Product Name', 'Status', 'Brand', 'Category', 'Price', 'Currency', 'SKU', 'Confidence Score', 'Source Document', 'Created At'];
      const rows = products.map(p => [
        escapeCsv(p._id),
        escapeCsv(p.name),
        escapeCsv(p.status),
        escapeCsv(p.brand || ''),
        escapeCsv(p.category || ''),
        escapeCsv(p.extractedData?.price ?? ''),
        escapeCsv(p.extractedData?.currency || ''),
        escapeCsv(p.extractedData?.sku || ''),
        escapeCsv(p.extractedData?.validation?.confidence?.score ?? ''),
        escapeCsv(p.sourceFile || ''),
        escapeCsv(p.createdAt ? new Date(p.createdAt).toISOString() : '')
      ].join(','));

      const csvContent = [headers.join(','), ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="flora_product_catalog.csv"');
      return res.status(200).send(csvContent);
    }

    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (err) {
    next(err);
  }
};
