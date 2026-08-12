import test from 'node:test';
import assert from 'node:assert';
import { validateExtractedData } from '../services/validationEngine.js';

// Ensure clean environment variables before tests
delete process.env.BRAND_WHITELIST;

test('Validation Engine Suite', async (t) => {

  await t.test('1. Ingestion of completely valid canonical product', () => {
    const validJson = JSON.stringify({
      productName: "Flora Smart Sensor",
      sku: "FL-SS-100",
      description: "Smart soil humidity and temperature sensor.",
      brand: "Flora",
      price: 49.99,
      currency: "USD",
      dimensions: "10 x 2 x 2 cm",
      specifications: {
        sensorType: "Capacitive",
        batteryLife: "2 years"
      },
      complianceFlags: ["CE", "RoHS"]
    });

    const result = validateExtractedData(validJson);

    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.warnings.length, 0);
    assert.strictEqual(result.cleanedData.productName, "Flora Smart Sensor");
    assert.strictEqual(result.cleanedData.sku, "FL-SS-100");
    assert.strictEqual(result.cleanedData.price, 49.99);
    assert.strictEqual(result.cleanedData.brand, "Flora");
    assert.strictEqual(result.confidence.score, 100);
    assert.strictEqual(result.confidence.evidenceLevel, "High");
    assert.ok(result.confidence.evidence.includes("productName successfully validated"));
    assert.ok(result.confidence.evidence.includes("sku successfully validated and matched format"));
    assert.ok(result.confidence.evidence.includes("brand successfully validated and matched whitelist"));
    assert.ok(result.confidence.evidence.includes("price successfully validated as positive number"));
    assert.ok(result.confidence.evidence.includes("currency successfully validated as 3-letter ISO code"));
  });

  await t.test('2. Ingestion of malformed JSON', () => {
    const malformedJson = "{ productName: 'Bad JSON', sku: FL-SS-100 "; // broken JSON syntax

    const result = validateExtractedData(malformedJson);

    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.cleanedData, null);
    assert.strictEqual(result.errors.length, 1);
    assert.strictEqual(result.errors[0].field, "JSON");
    assert.ok(result.errors[0].message.includes("Malformed Gemini JSON output"));
    assert.strictEqual(result.confidence.score, 0);
    assert.strictEqual(result.confidence.evidenceLevel, "Low");
  });

  await t.test('3. Missing required fields', () => {
    const missingFieldsJson = JSON.stringify({
      productName: "Flora Pot",
      // brand is missing
      // price is missing
      sku: "FL-POT-10",
      currency: "EUR"
    });

    const result = validateExtractedData(missingFieldsJson);

    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.errors.length, 2); // brand, price missing
    
    // Check that brand and price error objects are present
    const fieldsWithError = result.errors.map(e => e.field);
    assert.ok(fieldsWithError.includes("brand"));
    assert.ok(fieldsWithError.includes("price"));
    
    // Test score deductions: 2 errors (-30) and 4 missing optional fields warnings (desc, dim, specs, compliance) (-20)
    // 100 - 30 - 20 = 50
    assert.strictEqual(result.confidence.score, 50);
    assert.strictEqual(result.confidence.evidenceLevel, "Low");
  });

  await t.test('4. Alphanumeric SKU validation checks', () => {
    const invalidSkuJson = JSON.stringify({
      productName: "Flora Smart Sensor",
      sku: "FL#INVALID!", // contains invalid characters # and !
      brand: "FloraGrow",
      price: 15.00,
      currency: "USD"
    });

    const result = validateExtractedData(invalidSkuJson);

    assert.strictEqual(result.isValid, false);
    const skuError = result.errors.find(e => e.field === "sku");
    assert.ok(skuError);
    assert.ok(skuError.message.includes("SKU must be alphanumeric"));
  });

  await t.test('5. Type coercion for price strings', () => {
    const stringPriceJson = JSON.stringify({
      productName: "Flora Grow Tent",
      sku: "FL-GT-200",
      brand: "FloraGrow",
      price: " $149.99 ", // string price with spaces and dollar sign
      currency: "USD"
    });

    const result = validateExtractedData(stringPriceJson);

    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.cleanedData.price, 149.99);
  });

  await t.test('6. Non-whitelisted brand validation warning', () => {
    const invalidBrandJson = JSON.stringify({
      productName: "Flora Fertilizer",
      sku: "FL-FERT-5",
      brand: "GrowPlus", // Not in default whitelist ["FloraGrow", "Flora", "GreenHouse", "ApexGrow"]
      price: 12.50,
      currency: "USD",
      description: "Organic nutrient mix.",
      dimensions: "20x10x10 cm",
      specifications: { weight: "5kg" },
      complianceFlags: ["CE"]
    });

    const result = validateExtractedData(invalidBrandJson);

    // Should be invalid because of the brand warning
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.warnings.length, 1);
    assert.strictEqual(result.warnings[0].field, "brand");
    assert.strictEqual(result.warnings[0].value, "GrowPlus");

    // 100 - 5 (brand warning) = 95
    assert.strictEqual(result.confidence.score, 95);
    assert.strictEqual(result.confidence.evidenceLevel, "High");
  });

  await t.test('7. Configurable brand whitelist via environment variables', () => {
    process.env.BRAND_WHITELIST = "GrowPlus, PlantMaster";

    const customBrandJson = JSON.stringify({
      productName: "Flora Fertilizer",
      sku: "FL-FERT-5",
      brand: "GrowPlus", // Now whitelisted
      price: 12.50,
      currency: "USD",
      description: "Organic nutrient mix.",
      dimensions: "20x10x10 cm",
      specifications: { weight: "5kg" },
      complianceFlags: ["CE"]
    });

    const result = validateExtractedData(customBrandJson);

    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.warnings.length, 0);
    assert.strictEqual(result.confidence.score, 100);

    // Clean up environment variables
    delete process.env.BRAND_WHITELIST;
  });

  await t.test('8. Price constraints validation', () => {
    const negativePriceJson = JSON.stringify({
      productName: "Flora Grow Tent",
      sku: "FL-GT-200",
      brand: "FloraGrow",
      price: -10.00, // invalid negative price
      currency: "USD"
    });

    const result = validateExtractedData(negativePriceJson);

    assert.strictEqual(result.isValid, false);
    const priceError = result.errors.find(e => e.field === "price");
    assert.ok(priceError);
    assert.ok(priceError.message.includes("Price must be a positive decimal number"));
  });

  await t.test('9. Invalid ISO Currency code validation', () => {
    const invalidCurrencyJson = JSON.stringify({
      productName: "Flora Grow Tent",
      sku: "FL-GT-200",
      brand: "FloraGrow",
      price: 120.00,
      currency: "usd" // invalid: lowercase
    });

    const result = validateExtractedData(invalidCurrencyJson);

    assert.strictEqual(result.isValid, false);
    const currencyError = result.errors.find(e => e.field === "currency");
    assert.ok(currencyError);
  });

  await t.test('10. Invalid Specifications type', () => {
    const invalidSpecsJson = JSON.stringify({
      productName: "Flora Light",
      sku: "FL-L-50",
      brand: "FloraGrow",
      price: 29.99,
      currency: "USD",
      specifications: "wattage: 50W" // invalid: string instead of object
    });

    const result = validateExtractedData(invalidSpecsJson);

    assert.strictEqual(result.isValid, false);
    const specsError = result.errors.find(e => e.field === "specifications");
    assert.ok(specsError);
  });

  await t.test('11. Non-string Specifications value', () => {
    const invalidSpecsValJson = JSON.stringify({
      productName: "Flora Light",
      sku: "FL-L-50",
      brand: "FloraGrow",
      price: 29.99,
      currency: "USD",
      specifications: {
        wattage: 50 // invalid: number instead of string
      }
    });

    const result = validateExtractedData(invalidSpecsValJson);

    assert.strictEqual(result.isValid, false);
    const valError = result.errors.find(e => e.field === "specifications.wattage");
    assert.ok(valError);
  });

  await t.test('12. Invalid Compliance Flags type', () => {
    const invalidComplianceJson = JSON.stringify({
      productName: "Flora Light",
      sku: "FL-L-50",
      brand: "FloraGrow",
      price: 29.99,
      currency: "USD",
      complianceFlags: "CE, RoHS" // invalid: string instead of array
    });

    const result = validateExtractedData(invalidComplianceJson);

    assert.strictEqual(result.isValid, false);
    const complianceError = result.errors.find(e => e.field === "complianceFlags");
    assert.ok(complianceError);
  });

  await t.test('13. Non-string Compliance Flag element', () => {
    const invalidComplianceElJson = JSON.stringify({
      productName: "Flora Light",
      sku: "FL-L-50",
      brand: "FloraGrow",
      price: 29.99,
      currency: "USD",
      complianceFlags: ["CE", true] // invalid: boolean element
    });

    const result = validateExtractedData(invalidComplianceElJson);

    assert.strictEqual(result.isValid, false);
    const elError = result.errors.find(e => e.field === "complianceFlags[1]");
    assert.ok(elError);
  });

  await t.test('14. Confidence Score thresholds and evidence levels', () => {
    // Test Score 100 -> High (>= 90)
    const jsonHigh = JSON.stringify({
      productName: "Sensor", sku: "FL-SS-100", brand: "Flora", price: 10, currency: "USD",
      description: "D", dimensions: "D", specifications: { s: "s" }, complianceFlags: ["C"]
    });
    const resultHigh = validateExtractedData(jsonHigh);
    assert.strictEqual(resultHigh.confidence.evidenceLevel, "High");
    assert.strictEqual(resultHigh.confidence.score, 100);

    // Test Score 80 -> Medium (>= 70 and < 90)
    // 4 warnings (missing optional fields: desc, dim, specs, compliance)
    // score = 100 - 4*5 = 80
    const jsonMedium = JSON.stringify({
      productName: "Sensor", sku: "FL-SS-100", brand: "Flora", price: 10, currency: "USD"
    });
    const resultMedium = validateExtractedData(jsonMedium);
    assert.strictEqual(resultMedium.confidence.evidenceLevel, "Medium");
    assert.strictEqual(resultMedium.confidence.score, 80);

    // Test Score 60 -> Low (< 70)
    // 1 error (invalid currency -15) and 5 warnings (brand whitelist -5, 4 missing optional fields -20)
    // score = 100 - 15 - 25 = 60
    const jsonLow = JSON.stringify({
      productName: "Sensor", sku: "FL-SS-100", brand: "OtherBrand", price: 10, currency: "INVALID_CURR"
    });
    const resultLow = validateExtractedData(jsonLow);
    assert.strictEqual(resultLow.confidence.evidenceLevel, "Low");
    assert.strictEqual(resultLow.confidence.score, 60);
  });
});
