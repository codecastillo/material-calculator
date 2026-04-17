/**
 * Supplier Pricing API Adapters
 *
 * Adapter pattern for integrating with supplier pricing APIs.
 * Each adapter implements a common interface:
 *   - fetchPricing()    — Get full product/pricing catalog
 *   - searchProducts()  — Search for products by keyword
 *   - getProductDetail() — Get detail for a specific product/SKU
 *
 * To add a new supplier:
 *   1. Create a new adapter object with the three methods above
 *   2. Register it in the `adapters` map at the bottom of this file
 *   3. The pricing route will automatically pick it up
 */

// ---------------------------------------------------------------------------
// Pacific Supply Adapter
// ---------------------------------------------------------------------------
const pacificSupply = {
  name: 'Pacific Supply',
  baseUrl: null, // TODO: Set to Pacific Supply API base URL when available

  /**
   * Fetch full pricing catalog from Pacific Supply.
   * TODO: Replace stub with real API call.
   *
   * Real implementation would look like:
   *   const response = await fetch(`${this.baseUrl}/api/v1/products`, {
   *     headers: { 'Authorization': `Bearer ${process.env.PACIFIC_SUPPLY_API_KEY}` }
   *   });
   *   return response.json();
   */
  fetchPricing() {
    return {
      products: [
        { sku: 'PS-LATH-001', name: '2.5 LB Diamond Lath', unit: 'sheet', price: 4.50, category: 'Lath' },
        { sku: 'PS-LATH-002', name: '3.4 LB Diamond Lath', unit: 'sheet', price: 6.75, category: 'Lath' },
        { sku: 'PS-GRAY-001', name: 'Portland Cement (94lb)', unit: 'bag', price: 14.50, category: 'Gray Coat' },
        { sku: 'PS-GRAY-002', name: 'Plaster Sand (ton)', unit: 'ton', price: 45.00, category: 'Gray Coat' },
        { sku: 'PS-CLR-001', name: 'Omega One Coat Stucco', unit: 'bag', price: 22.00, category: 'Color Coat' },
        { sku: 'PS-STN-001', name: 'Cultured Stone Veneer', unit: 'sqft', price: 8.50, category: 'Stone' },
      ],
      _stub: true,
      _note: 'Replace with real Pacific Supply API integration'
    };
  },

  /**
   * Search for products by keyword.
   * @param {string} query - Search term
   */
  searchProducts(query) {
    // TODO: Replace with real API call
    // const response = await fetch(`${this.baseUrl}/api/v1/products/search?q=${query}`);
    const allProducts = this.fetchPricing().products;
    const lowerQuery = (query || '').toLowerCase();
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.sku.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Get detail for a specific product.
   * @param {string} sku - Product SKU
   */
  getProductDetail(sku) {
    // TODO: Replace with real API call
    // const response = await fetch(`${this.baseUrl}/api/v1/products/${sku}`);
    const allProducts = this.fetchPricing().products;
    return allProducts.find(p => p.sku === sku) || null;
  }
};

// ---------------------------------------------------------------------------
// ABC Supply Adapter
// ---------------------------------------------------------------------------
const abcSupply = {
  name: 'ABC Supply',
  baseUrl: null, // TODO: Set to ABC Supply API base URL when available

  /**
   * Fetch full pricing catalog from ABC Supply.
   * TODO: Replace stub with real API call.
   *
   * ABC Supply may use a different authentication method (e.g., OAuth2).
   * Real implementation would look like:
   *   const token = await this.authenticate();
   *   const response = await fetch(`${this.baseUrl}/catalog`, {
   *     headers: { 'Authorization': `Bearer ${token}` }
   *   });
   *   return response.json();
   */
  fetchPricing() {
    // ABC Supply prices are ~3% higher than Pacific Supply in this stub
    const priceModifier = 1.03;
    return {
      products: [
        { sku: 'ABC-LATH-001', name: '2.5 LB Diamond Lath', unit: 'sheet', price: +(4.50 * priceModifier).toFixed(2), category: 'Lath' },
        { sku: 'ABC-LATH-002', name: '3.4 LB Diamond Lath', unit: 'sheet', price: +(6.75 * priceModifier).toFixed(2), category: 'Lath' },
        { sku: 'ABC-GRAY-001', name: 'Portland Cement (94lb)', unit: 'bag', price: +(14.50 * priceModifier).toFixed(2), category: 'Gray Coat' },
        { sku: 'ABC-GRAY-002', name: 'Plaster Sand (ton)', unit: 'ton', price: +(45.00 * priceModifier).toFixed(2), category: 'Gray Coat' },
        { sku: 'ABC-CLR-001', name: 'Omega One Coat Stucco', unit: 'bag', price: +(22.00 * priceModifier).toFixed(2), category: 'Color Coat' },
        { sku: 'ABC-STN-001', name: 'Cultured Stone Veneer', unit: 'sqft', price: +(8.50 * priceModifier).toFixed(2), category: 'Stone' },
      ],
      _stub: true,
      _note: 'Replace with real ABC Supply API integration'
    };
  },

  searchProducts(query) {
    const allProducts = this.fetchPricing().products;
    const lowerQuery = (query || '').toLowerCase();
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.sku.toLowerCase().includes(lowerQuery)
    );
  },

  getProductDetail(sku) {
    const allProducts = this.fetchPricing().products;
    return allProducts.find(p => p.sku === sku) || null;
  }
};

// ---------------------------------------------------------------------------
// Sherwin Williams Adapter
// ---------------------------------------------------------------------------
const sherwinWilliams = {
  name: 'Sherwin Williams',
  baseUrl: null, // TODO: Set to Sherwin Williams API base URL

  /**
   * Fetch pricing from Sherwin Williams.
   *
   * Sherwin Williams offers a developer API for product data.
   * See: https://developers.sherwin-williams.com/ (if available)
   *
   * Example real integration:
   *
   *   // 1. Authenticate with Sherwin Williams OAuth2
   *   const authResponse = await fetch('https://api.sherwin-williams.com/oauth/token', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
   *     body: new URLSearchParams({
   *       grant_type: 'client_credentials',
   *       client_id: process.env.SW_CLIENT_ID,
   *       client_secret: process.env.SW_CLIENT_SECRET
   *     })
   *   });
   *   const { access_token } = await authResponse.json();
   *
   *   // 2. Fetch product catalog
   *   const catalogResponse = await fetch('https://api.sherwin-williams.com/v1/products', {
   *     headers: {
   *       'Authorization': `Bearer ${access_token}`,
   *       'Accept': 'application/json'
   *     }
   *   });
   *   return catalogResponse.json();
   *
   *   // 3. Map SW product schema to our internal format:
   *   //    { sku, name, unit, price, category }
   */
  fetchPricing() {
    return {
      products: [
        { sku: 'SW-DW-001', name: 'USG Sheetrock 4x8 1/2"', unit: 'sheet', price: 12.50, category: 'Drywall' },
        { sku: 'SW-DW-002', name: 'USG Sheetrock 4x12 1/2"', unit: 'sheet', price: 18.75, category: 'Drywall' },
        { sku: 'SW-DW-003', name: 'Joint Compound (5 gal)', unit: 'bucket', price: 16.00, category: 'Drywall' },
        { sku: 'SW-DW-004', name: 'Paper Tape (500ft)', unit: 'roll', price: 5.50, category: 'Drywall' },
        { sku: 'SW-PT-001', name: 'Duration Exterior Latex', unit: 'gallon', price: 72.00, category: 'Painting' },
        { sku: 'SW-PT-002', name: 'SuperPaint Interior Latex', unit: 'gallon', price: 62.00, category: 'Painting' },
        { sku: 'SW-PT-003', name: 'PrimeRx Primer', unit: 'gallon', price: 48.00, category: 'Painting' },
        { sku: 'SW-PT-004', name: 'Caulk Paintable (10oz)', unit: 'tube', price: 6.50, category: 'Painting' },
      ],
      _stub: true,
      _note: 'Replace with real Sherwin Williams API integration. See OAuth2 example in comments above.'
    };
  },

  searchProducts(query) {
    // TODO: Use Sherwin Williams search API
    // const response = await fetch(`https://api.sherwin-williams.com/v1/products/search?q=${query}`, { ... });
    const allProducts = this.fetchPricing().products;
    const lowerQuery = (query || '').toLowerCase();
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.sku.toLowerCase().includes(lowerQuery)
    );
  },

  getProductDetail(sku) {
    // TODO: Use Sherwin Williams product detail API
    // const response = await fetch(`https://api.sherwin-williams.com/v1/products/${sku}`, { ... });
    const allProducts = this.fetchPricing().products;
    return allProducts.find(p => p.sku === sku) || null;
  }
};

// ---------------------------------------------------------------------------
// Adapter Registry
// ---------------------------------------------------------------------------
// Register adapters by normalized name (lowercase, hyphens instead of spaces).
// The pricing route uses this map to find the right adapter.
const adapters = {
  'pacific-supply': pacificSupply,
  'abc-supply': abcSupply,
  'sherwin-williams': sherwinWilliams,
};

module.exports = { adapters, pacificSupply, abcSupply, sherwinWilliams };
