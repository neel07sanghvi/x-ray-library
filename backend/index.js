const express = require('express');
const cors = require('cors');
const { createXRay } = require('../xray-lib/dist/index.js');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for traces
const traces = [];

// Mock data for competitor products
const mockProducts = [
  { asin: 'B0COMP01', title: 'HydroFlask 32oz Wide Mouth', price: 44.99, rating: 4.5, reviews: 8932 },
  { asin: 'B0COMP02', title: 'Yeti Rambler 26oz', price: 34.99, rating: 4.4, reviews: 5621 },
  { asin: 'B0COMP03', title: 'Generic Water Bottle', price: 8.99, rating: 3.2, reviews: 45 },
  { asin: 'B0COMP04', title: 'Bottle Cleaning Brush Set', price: 12.99, rating: 4.6, reviews: 3421 },
  { asin: 'B0COMP05', title: 'Replacement Lid for HydroFlask', price: 9.99, rating: 4.1, reviews: 892 },
  { asin: 'B0COMP06', title: 'Water Bottle Carrier Bag', price: 15.99, rating: 4.3, reviews: 234 },
  { asin: 'B0COMP07', title: 'Stanley Adventure Quencher', price: 35.00, rating: 4.3, reviews: 4102 },
  { asin: 'B0COMP08', title: 'Contigo AutoSeal Bottle', price: 22.99, rating: 4.2, reviews: 2156 },
  { asin: 'B0COMP09', title: 'Nalgene Wide Mouth 32oz', price: 18.99, rating: 4.4, reviews: 6789 },
  { asin: 'B0COMP10', title: 'CamelBak Chute Mag 32oz', price: 24.99, rating: 4.3, reviews: 3421 },
];

// Demo: Competitor Selection Workflow
function runCompetitorSelection() {
  const xray = createXRay();
  const traceId = `trace-${Date.now()}`;

  xray.startTrace(traceId, {
    workflow: 'competitor-selection',
    description: 'Find best competitor for water bottle product',
  });

  // Reference product
  const referenceProduct = {
    asin: 'B0XYZ123',
    title: 'ProBrand Steel Bottle 32oz Insulated',
    price: 29.99,
    rating: 4.2,
    reviews: 1247,
    category: 'Sports & Outdoors > Water Bottles',
  };

  // Step 1: Generate Keywords (Mock LLM)
  const keywords = ['stainless steel water bottle insulated', 'vacuum insulated bottle 32oz'];
  xray.logStep(
    'keyword_generation',
    {
      product_title: referenceProduct.title,
      category: referenceProduct.category,
    },
    {
      keywords,
      model: 'gpt-4-mock',
    },
    'Extracted key product attributes: material (stainless steel), capacity (32oz), feature (insulated)',
    { llm_call: true }
  );

  // Step 2: Search Candidates (Mock API)
  const searchKeyword = keywords[0];
  const candidates = mockProducts;
  xray.logStep(
    'candidate_search',
    {
      keyword: searchKeyword,
      limit: 50,
    },
    {
      total_results: 2847,
      candidates_fetched: candidates.length,
      candidates,
    },
    `Fetched top ${candidates.length} results by relevance; 2847 total matches found`,
    { api_call: true }
  );

  // Step 3: Apply Filters
  const priceMin = referenceProduct.price * 0.5;
  const priceMax = referenceProduct.price * 2.0;
  const minRating = 3.8;
  const minReviews = 100;

  const evaluations = candidates.map((product) => {
    const pricePass = product.price >= priceMin && product.price <= priceMax;
    const ratingPass = product.rating >= minRating;
    const reviewsPass = product.reviews >= minReviews;
    const qualified = pricePass && ratingPass && reviewsPass;

    return {
      asin: product.asin,
      title: product.title,
      metrics: {
        price: product.price,
        rating: product.rating,
        reviews: product.reviews,
      },
      filter_results: {
        price_range: {
          passed: pricePass,
          detail: pricePass
            ? `$${product.price} is within $${priceMin.toFixed(2)}-$${priceMax.toFixed(2)}`
            : `$${product.price} is ${product.price < priceMin ? 'below' : 'above'} range`,
        },
        min_rating: {
          passed: ratingPass,
          detail: ratingPass ? `${product.rating} >= ${minRating}` : `${product.rating} < ${minRating}`,
        },
        min_reviews: {
          passed: reviewsPass,
          detail: reviewsPass ? `${product.reviews} >= ${minReviews}` : `${product.reviews} < ${minReviews}`,
        },
      },
      qualified,
    };
  });

  const qualified = evaluations.filter((e) => e.qualified);

  xray.logStep(
    'apply_filters',
    {
      candidates_count: candidates.length,
      reference_product: {
        asin: referenceProduct.asin,
        title: referenceProduct.title,
        price: referenceProduct.price,
        rating: referenceProduct.rating,
        reviews: referenceProduct.reviews,
      },
    },
    {
      filters_applied: {
        price_range: { min: priceMin, max: priceMax, rule: '0.5x - 2x of reference price' },
        min_rating: { value: minRating, rule: 'Must be at least 3.8 stars' },
        min_reviews: { value: minReviews, rule: 'Must have at least 100 reviews' },
      },
      evaluations,
      total_evaluated: candidates.length,
      passed: qualified.length,
      failed: candidates.length - qualified.length,
    },
    `Applied price, rating, and review count filters to narrow candidates from ${candidates.length} to ${qualified.length}`,
    { filter_step: true }
  );

  // Step 4: Rank & Select
  const ranked = qualified
    .map((q) => {
      const product = candidates.find((c) => c.asin === q.asin);
      const reviewScore = product.reviews / 10000; // Normalize
      const ratingScore = product.rating / 5.0;
      const priceProximity = 1 - Math.abs(product.price - referenceProduct.price) / referenceProduct.price;
      const totalScore = reviewScore * 0.5 + ratingScore * 0.3 + priceProximity * 0.2;

      return {
        asin: q.asin,
        title: q.title,
        metrics: q.metrics,
        score_breakdown: {
          review_count_score: reviewScore,
          rating_score: ratingScore,
          price_proximity_score: priceProximity,
        },
        total_score: totalScore,
      };
    })
    .sort((a, b) => b.total_score - a.total_score);

  const selected = ranked[0];

  xray.logStep(
    'rank_and_select',
    {
      candidates_count: qualified.length,
      reference_product: {
        asin: referenceProduct.asin,
        title: referenceProduct.title,
        price: referenceProduct.price,
        rating: referenceProduct.rating,
        reviews: referenceProduct.reviews,
      },
    },
    {
      ranking_criteria: {
        primary: 'review_count',
        secondary: 'rating',
        tertiary: 'price_proximity',
      },
      ranked_candidates: ranked.map((r, idx) => ({ ...r, rank: idx + 1 })),
      selection: {
        asin: selected.asin,
        title: selected.title,
        reason: `Highest overall score (${selected.total_score.toFixed(2)}) - strong review count (${selected.metrics.reviews}) with excellent rating (${selected.metrics.rating}★)`,
      },
      selected_competitor: {
        asin: selected.asin,
        title: selected.title,
        price: selected.metrics.price,
        rating: selected.metrics.rating,
        reviews: selected.metrics.reviews,
      },
    },
    `Selected ${selected.title} as best competitor based on weighted scoring algorithm`,
    { selection_step: true }
  );

  const trace = xray.endTrace();
  traces.push(trace);

  return trace;
}

// API Routes

// Get all traces
app.get('/api/traces', (req, res) => {
  res.json(traces);
});

// Get specific trace
app.get('/api/traces/:id', (req, res) => {
  const trace = traces.find((t) => t.traceId === req.params.id);
  if (!trace) {
    return res.status(404).json({ error: 'Trace not found' });
  }
  res.json(trace);
});

// Store a trace
app.post('/api/traces', (req, res) => {
  const trace = req.body;
  traces.push(trace);
  res.status(201).json(trace);
});

// Run demo workflow
app.post('/api/demo/run', (req, res) => {
  try {
    const trace = runCompetitorSelection();
    res.json(trace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', traces_count: traces.length });
});

app.listen(PORT, () => {
  console.log(`X-Ray Backend running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET  /api/traces     - List all traces`);
  console.log(`  GET  /api/traces/:id - Get specific trace`);
  console.log(`  POST /api/traces     - Store a trace`);
  console.log(`  POST /api/demo/run   - Run demo workflow`);
});
