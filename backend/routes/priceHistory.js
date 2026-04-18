const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/material/:materialId', async (req, res, next) => {
  try {
    const { data: history, error } = await supabase.from('price_history')
      .select('*').eq('material_id', req.params.materialId).order('changed_at', { ascending: false }).limit(50);
    if (error) throw error;
    res.json({ history: history || [] });
  } catch (err) { next(err); }
});

module.exports = router;
