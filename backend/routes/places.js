const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/auth');

// Tighter window on this endpoint to limit Google API spend from any single
// authenticated user if their token were somehow misused.
const PLACES_RATE_WINDOW_MS = 60 * 1000; // 1 minute
const PLACES_RATE_MAX = 30;

// Maximum length we accept for an autocomplete query string. Google's limit
// is 5000 bytes, but we need far less for an address fragment.
const INPUT_MAX_LENGTH = 200;

const placesLimiter = rateLimit({
  windowMs: PLACES_RATE_WINDOW_MS,
  max: PLACES_RATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

router.use(authenticate);
router.use(placesLimiter);

function placesKey() {
  return process.env.GOOGLE_PLACES_API_KEY || '';
}

// POST /api/places/autocomplete
// Body: { input: string, locationBias?: { circle: { center: { latitude, longitude }, radius } } }
// Returns: { suggestions: [{ text, placeId }] }
router.post('/autocomplete', async (req, res) => {
  const key = placesKey();
  if (!key) return res.status(503).json({ error: 'Address search is unavailable' });

  const { input, locationBias } = req.body || {};
  if (!input || typeof input !== 'string' || !input.trim()) {
    return res.status(400).json({ error: 'input is required' });
  }
  if (input.length > INPUT_MAX_LENGTH) {
    return res.status(400).json({ error: 'input is too long' });
  }

  const googleBody = {
    input: input.trim(),
    regionCode: 'us',
    includedPrimaryTypes: ['street_address', 'premise', 'subpremise'],
  };

  // Only forward the locationBias if it has the exact structure we expect,
  // so we never relay arbitrary attacker-controlled JSON to Google.
  if (
    locationBias &&
    typeof locationBias === 'object' &&
    locationBias.circle &&
    typeof locationBias.circle.center?.latitude === 'number' &&
    typeof locationBias.circle.center?.longitude === 'number'
  ) {
    googleBody.locationBias = {
      circle: {
        center: {
          latitude: locationBias.circle.center.latitude,
          longitude: locationBias.circle.center.longitude,
        },
        radius: 50000,
      },
    };
  }

  let googleRes;
  try {
    googleRes = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
      },
      body: JSON.stringify(googleBody),
    });
  } catch (err) {
    console.error('[places/autocomplete] upstream fetch error:', err.message);
    return res.status(502).json({ suggestions: [] });
  }

  if (!googleRes.ok) {
    console.error('[places/autocomplete] upstream error status:', googleRes.status);
    return res.status(502).json({ suggestions: [] });
  }

  let data;
  try {
    data = await googleRes.json();
  } catch (err) {
    console.error('[places/autocomplete] upstream parse error:', err.message);
    return res.status(502).json({ suggestions: [] });
  }

  const suggestions = (data.suggestions || [])
    .map((s) => s.placePrediction)
    .filter(Boolean)
    .map((p) => ({ text: p.text?.text || '', placeId: p.placeId || '' }))
    .filter((s) => s.text && s.placeId);

  res.json({ suggestions });
});

// GET /api/places/details/:placeId
// Returns: { formattedAddress }
router.get('/details/:placeId', async (req, res) => {
  const key = placesKey();
  if (!key) return res.status(503).json({ error: 'Address search is unavailable' });

  const placeId = req.params.placeId;
  if (!placeId || typeof placeId !== 'string') {
    return res.status(400).json({ error: 'placeId is required' });
  }

  let googleRes;
  try {
    googleRes = await fetch(
      'https://places.googleapis.com/v1/places/' + encodeURIComponent(placeId),
      {
        headers: {
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'formattedAddress',
        },
      }
    );
  } catch (err) {
    console.error('[places/details] upstream fetch error:', err.message);
    return res.status(502).json({ error: 'Address lookup failed' });
  }

  if (googleRes.status === 404) return res.status(404).json({ error: 'Place not found' });
  if (!googleRes.ok) {
    console.error('[places/details] upstream error status:', googleRes.status);
    return res.status(502).json({ error: 'Address lookup failed' });
  }

  let data;
  try {
    data = await googleRes.json();
  } catch (err) {
    console.error('[places/details] upstream parse error:', err.message);
    return res.status(502).json({ error: 'Address lookup failed' });
  }

  if (!data.formattedAddress) return res.status(404).json({ error: 'Place not found' });

  res.json({ formattedAddress: data.formattedAddress });
});

module.exports = router;
