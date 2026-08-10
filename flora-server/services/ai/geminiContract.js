/**
 * Canonical Product Schema for Gemini Structured Ingestion
 * 
 * Defines the structural layout and validation rules for products extracted from catalogs.
 */
const CANONICAL_PRODUCT_SCHEMA = {
  type: 'object',
  description: 'Schema representing a parsed canonical product extracted from catalog sources.',
  properties: {
    productName: {
      type: 'string',
      description: 'Required. The canonical name of the product.'
    },
    sku: {
      type: 'string',
      description: 'Required. Unique SKU or Part Number identifier for the product.'
    },
    description: {
      type: 'string',
      description: 'Optional. Textual description or summary of the product catalog entry.'
    },
    brand: {
      type: 'string',
      description: 'Required. The manufacturer brand name (e.g. FloraGrow, GreenHouse, ApexGrow, FloraX).'
    },
    price: {
      type: 'number',
      description: 'Required. The positive decimal numeric unit price.'
    },
    currency: {
      type: 'string',
      description: 'Required. ISO 4217 currency code such as USD or EUR. Must be a 3-letter uppercase code.'
    },
    dimensions: {
      type: 'string',
      description: 'Optional. Physical sizes and dimensions (e.g., 20 x 15 x 12 cm).'
    },
    specifications: {
      type: 'object',
      description: 'Optional. Arbitrary key-value specifications extracted from tables (e.g., power: "200W", voltage: "24V").'
    },
    complianceFlags: {
      type: 'array',
      items: {
        type: 'string'
      },
      description: 'Optional. Regulatory compliance marks found on the product (e.g., CE, RoHS, UL).'
    }
  },
  required: ['productName', 'sku', 'brand', 'price', 'currency']
};

module.exports = {
  CANONICAL_PRODUCT_SCHEMA
};
