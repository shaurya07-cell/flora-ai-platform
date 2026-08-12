const CANONICAL_SPECIFICATION_FIELDS = [
    'name',
    'value'
];

function normalizeSpecifications(specifications) {
    if (!Array.isArray(specifications)) {
        return {};
    }

    const normalized = {};

    for (const specification of specifications) {
        if (!specification || typeof specification !== 'object') {
            continue;
        }

        const name = typeof specification.name === 'string'
            ? specification.name.trim()
            : '';

        const value = typeof specification.value === 'string'
            ? specification.value.trim()
            : '';

        if (!name || !value) {
            continue;
        }

        normalized[name] = value;
    }

    return normalized;
}

function normalizeGeminiProduct(geminiProduct) {
    if (!geminiProduct || typeof geminiProduct !== 'object') {
        throw new TypeError('geminiProduct must be an object');
    }

    return {
        productName: typeof geminiProduct.productName === 'string'
            ? geminiProduct.productName.trim()
            : '',

        sku: typeof geminiProduct.sku === 'string'
            ? geminiProduct.sku.trim()
            : '',

        description: typeof geminiProduct.description === 'string'
            ? geminiProduct.description.trim()
            : '',

        brand: typeof geminiProduct.brand === 'string'
            ? geminiProduct.brand.trim()
            : '',

        price: geminiProduct.price,

        currency: typeof geminiProduct.currency === 'string'
            ? geminiProduct.currency.trim().toUpperCase()
            : '',

        dimensions: typeof geminiProduct.dimensions === 'string'
            ? geminiProduct.dimensions.trim()
            : '',

        specifications: normalizeSpecifications(
            geminiProduct.specifications
        ),

        complianceFlags: Array.isArray(geminiProduct.complianceFlags)
            ? geminiProduct.complianceFlags
                .filter(flag => typeof flag === 'string')
                .map(flag => flag.trim())
                .filter(Boolean)
            : []
    };
}

export {
    normalizeSpecifications,
    normalizeGeminiProduct
};