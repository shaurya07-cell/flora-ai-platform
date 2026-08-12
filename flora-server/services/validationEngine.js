/**
 * Flora – Ingestion Validation Engine
 * Exposes a standalone validation logic for extracted product catalog data.
 */

/**
 * Safely parses and validates the structured JSON string returned by Gemini.
 * Performs Level A (API/Schema) and Level B (Business) validations.
 * 
 * @param {string} rawGeminiText - The raw string payload returned by the Gemini AI API.
 * @returns {object} The validation result object.
 */
function validateExtractedData(rawGeminiText) {
  let parsedJson = null;
  let parseError = null;

  // 1. JSON Parsing
  try {
    if (typeof rawGeminiText !== 'string' || !rawGeminiText.trim()) {
      throw new Error("Empty or invalid string input");
    }
    parsedJson = JSON.parse(rawGeminiText);
  } catch (err) {
    parseError = err;
    return {
      isValid: false,
      cleanedData: null,
      errors: [
        {
          field: "JSON",
          message: `Malformed Gemini JSON output: ${parseError.message}`,
          value: rawGeminiText
        }
      ],
      warnings: [],
      confidence: {
        score: 0,
        evidenceLevel: "Low",
        evidence: ["Failed to parse raw Gemini JSON"]
      }
    };
  }

  const errors = [];
  const warnings = [];
  const evidence = [];

  // Helper to safely clean string inputs
  const cleanStr = (val) => (typeof val === 'string' ? val.trim() : val);

  // 2. Deterministic Type Normalization
  let coercedPrice = null;
  if (parsedJson.price !== undefined && parsedJson.price !== null) {
    if (typeof parsedJson.price === 'number') {
      coercedPrice = parsedJson.price;
    } else if (typeof parsedJson.price === 'string') {
      const cleanedPrice = parsedJson.price.trim().replace(/[^\d.-]/g, '');
      if (cleanedPrice !== '' && !isNaN(cleanedPrice)) {
        coercedPrice = parseFloat(cleanedPrice);
      }
    }
  }

  let coercedSpecs = {};
  if (parsedJson.specifications !== undefined && parsedJson.specifications !== null) {
    if (typeof parsedJson.specifications === 'object' && !Array.isArray(parsedJson.specifications)) {
      for (const [key, val] of Object.entries(parsedJson.specifications)) {
        if (val !== null && val !== undefined) {
          if (typeof val !== 'string') {
            errors.push({
              field: `specifications.${key}`,
              message: "Specification value must be a string",
              value: val
            });
          } else {
            coercedSpecs[key] = val;
          }
        }
      }
    } else {
      errors.push({
        field: "specifications",
        message: "Specifications must be a key-value object of strings",
        value: parsedJson.specifications
      });
    }
  }

  let coercedCompliance = [];
  if (parsedJson.complianceFlags !== undefined && parsedJson.complianceFlags !== null) {
    if (Array.isArray(parsedJson.complianceFlags)) {
      for (let i = 0; i < parsedJson.complianceFlags.length; i++) {
        const flag = parsedJson.complianceFlags[i];
        if (typeof flag !== 'string') {
          errors.push({
            field: `complianceFlags[${i}]`,
            message: "Compliance flag must be a string",
            value: flag
          });
        } else {
          coercedCompliance.push(flag);
        }
      }
    } else {
      errors.push({
        field: "complianceFlags",
        message: "Compliance flags must be an array of strings",
        value: parsedJson.complianceFlags
      });
    }
  }

  // 3. API & Schema Validation (Level A Checks)
  // productName Validation
  const productName = cleanStr(parsedJson.productName);
  if (productName === undefined || productName === null || productName === '') {
    errors.push({
      field: "productName",
      message: "Product name is required and cannot be empty",
      value: parsedJson.productName
    });
  } else if (typeof parsedJson.productName !== 'string') {
    errors.push({
      field: "productName",
      message: "Product name must be a string",
      value: parsedJson.productName
    });
  } else if (productName.length > 255) {
    errors.push({
      field: "productName",
      message: "Product name must not exceed 255 characters",
      value: parsedJson.productName
    });
  } else {
    evidence.push("productName successfully validated");
  }

  // SKU Validation
  const sku = cleanStr(parsedJson.sku);
  const skuRegex = /^[A-Z0-9\-_]{3,50}$/i;
  if (sku === undefined || sku === null || sku === '') {
    errors.push({
      field: "sku",
      message: "SKU is required and cannot be empty",
      value: parsedJson.sku
    });
  } else if (typeof parsedJson.sku !== 'string') {
    errors.push({
      field: "sku",
      message: "SKU must be a string",
      value: parsedJson.sku
    });
  } else if (!skuRegex.test(sku)) {
    errors.push({
      field: "sku",
      message: "SKU must be alphanumeric (3-50 characters) and can include dashes or underscores",
      value: parsedJson.sku
    });
  } else {
    evidence.push("sku successfully validated and matched format");
  }

  // Brand Validation & Business Whitelist Validation (Level B)
  const brand = cleanStr(parsedJson.brand);
  if (brand === undefined || brand === null || brand === '') {
    errors.push({
      field: "brand",
      message: "Brand is required and cannot be empty",
      value: parsedJson.brand
    });
  } else if (typeof parsedJson.brand !== 'string') {
    errors.push({
      field: "brand",
      message: "Brand must be a string",
      value: parsedJson.brand
    });
  } else {
    // Whitelist check
    const brandWhitelist = (process.env.BRAND_WHITELIST || "FloraGrow,Flora,GreenHouse,ApexGrow").split(",").map(b => b.trim());
    const isWhitelisted = brandWhitelist.some(b => b.toLowerCase() === brand.toLowerCase());
    if (!isWhitelisted) {
      warnings.push({
        field: "brand",
        message: `Brand '${brand}' is not in the whitelist.`,
        value: brand
      });
    } else {
      evidence.push("brand successfully validated and matched whitelist");
    }
  }

  // Price Validation
  if (parsedJson.price === undefined || parsedJson.price === null) {
    errors.push({
      field: "price",
      message: "Price is required",
      value: parsedJson.price
    });
  } else if (coercedPrice === null || isNaN(coercedPrice) || coercedPrice <= 0.0) {
    errors.push({
      field: "price",
      message: "Price must be a positive decimal number",
      value: parsedJson.price
    });
  } else {
    evidence.push("price successfully validated as positive number");
  }

  // Currency Validation
  const currency = cleanStr(parsedJson.currency);
  const currencyRegex = /^[A-Z]{3}$/;
  if (currency === undefined || currency === null || currency === '') {
    errors.push({
      field: "currency",
      message: "Currency is required and cannot be empty",
      value: parsedJson.currency
    });
  } else if (typeof parsedJson.currency !== 'string') {
    errors.push({
      field: "currency",
      message: "Currency must be a string",
      value: parsedJson.currency
    });
  } else if (!currencyRegex.test(currency)) {
    errors.push({
      field: "currency",
      message: "Currency must be a 3-letter uppercase ISO code",
      value: parsedJson.currency
    });
  } else {
    evidence.push("currency successfully validated as 3-letter ISO code");
  }

  // Optional fields checks
  const description = cleanStr(parsedJson.description);
  if (description !== undefined && description !== null && description !== '') {
    if (typeof parsedJson.description !== 'string') {
      errors.push({
        field: "description",
        message: "Description must be a string",
        value: parsedJson.description
      });
    } else {
      evidence.push("description successfully validated");
    }
  } else {
    warnings.push({
      field: "description",
      message: "Description is missing or empty",
      value: parsedJson.description
    });
  }

  const dimensions = cleanStr(parsedJson.dimensions);
  if (dimensions !== undefined && dimensions !== null && dimensions !== '') {
    if (typeof parsedJson.dimensions !== 'string') {
      errors.push({
        field: "dimensions",
        message: "Dimensions must be a string",
        value: parsedJson.dimensions
      });
    } else {
      evidence.push("dimensions successfully validated");
    }
  } else {
    warnings.push({
      field: "dimensions",
      message: "Dimensions is missing or empty",
      value: parsedJson.dimensions
    });
  }

  if (parsedJson.specifications !== undefined && parsedJson.specifications !== null && Object.keys(coercedSpecs).length > 0) {
    evidence.push("specifications successfully validated");
  } else {
    warnings.push({
      field: "specifications",
      message: "Specifications are missing or empty",
      value: parsedJson.specifications
    });
  }

  if (parsedJson.complianceFlags !== undefined && parsedJson.complianceFlags !== null && coercedCompliance.length > 0) {
    evidence.push("complianceFlags successfully validated");
  } else {
    warnings.push({
      field: "complianceFlags",
      message: "Compliance flags are missing or empty",
      value: parsedJson.complianceFlags
    });
  }

  // 4. In-Memory Validation Status Definition
  const isValid = errors.length === 0 && warnings.length === 0;

  // 5. Confidence Score Calculation
  let score = 100;
  score -= errors.length * 15;
  score -= warnings.length * 5;
  score = Math.max(0, Math.min(100, score));

  let evidenceLevel = "Low";
  if (score >= 90) {
    evidenceLevel = "High";
  } else if (score >= 70) {
    evidenceLevel = "Medium";
  }

  // 6. Build Cleaned Canonical Product Object
  const cleanedData = {
    productName: productName || "",
    sku: sku || "",
    description: description || "",
    brand: brand || "",
    price: coercedPrice !== null ? coercedPrice : 0,
    currency: currency || "",
    dimensions: dimensions || "",
    specifications: coercedSpecs,
    complianceFlags: coercedCompliance
  };

  return {
    isValid,
    cleanedData,
    errors,
    warnings,
    confidence: {
      score,
      evidenceLevel,
      evidence
    }
  };
}

export {
  validateExtractedData
};
