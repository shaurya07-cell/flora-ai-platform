/**
 * Canonical Product Schema for Gemini Structured Ingestion
 * 
 * Defines the structural layout and validation rules for products extracted from catalogs.
 */
export const CANONICAL_PRODUCT_SCHEMA = {
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
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The specification name exactly as found in the document table or text.'
          },
          value: {
            type: 'string',
            description: 'The specification value exactly as found in the document.'
          }
        },
        required: ['name', 'value']
      },
      description: 'Optional. Product specifications extracted from tables or text as name-value pairs.'
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
