const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/material/:materialId', async (req, res, next) => {
  try {
    // Verify material belongs to a supplier owned by the user
    const { data: mat } = await supabase.from('materials').select('supplier_id').eq('id', req.params.materialId).single();
    if (!mat) return res.status(404).json({ error: 'Material not found' });
    const { data: sup } = await supabase.from('suppliers').select('id').eq('id', mat.supplier_id).eq('user_id', req.user.id).single();
    if (!sup) return res.status(403).json({ error: 'Access denied' });

    const { data: history, error } = await supabase.from('price_history')
      .select('*').eq('material_id', req.params.materialId).order('changed_at', { ascending: false }).limit(50);
    if (error) throw error;
    res.json({ history: history || [] });
  } catch (err) { next(err); }
});

module.exports = router;
