const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET / — list user's invoices with client and job names
router.get('/', async (req, res, next) => {
  try {
    const { data: invoices, error } = await supabase.from('invoices')
      .select('*, clients(name), jobs(name)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ invoices: invoices || [] });
  } catch (err) { next(err); }
});

// GET /:id — get single invoice with full details
router.get('/:id', async (req, res, next) => {
  try {
    const { data: invoice, error } = await supabase.from('invoices')
      .select('*, clients(name), jobs(name)')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();
    if (error) throw error;
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ invoice });
  } catch (err) { next(err); }
});

// POST / — create invoice with auto-generated invoice number
router.post('/', async (req, res, next) => {
  try {
    const { job_id, client_id, due_date, notes, total } = req.body;
    if (!job_id || !client_id) return res.status(400).json({ error: 'job_id and client_id are required' });

    // Auto-generate invoice number: INV-YYYY-XXXX
    const year = new Date().getFullYear();
    const seq = String(Math.floor(1000 + Math.random() * 9000));
    const invoice_number = `INV-${year}-${seq}`;

    const { data: invoice, error } = await supabase.from('invoices').insert({
      user_id: req.user.id,
      job_id,
      client_id,
      invoice_number,
      status: 'draft',
      due_date: due_date || null,
      notes: notes || '',
      total: total || 0
    }).select('*, clients(name), jobs(name)').single();
    if (error) throw error;
    res.status(201).json({ invoice });
  } catch (err) { next(err); }
});

// PUT /:id — update invoice
router.put('/:id', async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.status) {
      const validStatuses = ['draft', 'sent', 'paid', 'overdue'];
      if (!validStatuses.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status. Must be one of: draft, sent, paid, overdue' });
      updates.status = req.body.status;
    }
    if (req.body.notes !== undefined) updates.notes = req.body.notes;
    if (req.body.due_date !== undefined) updates.due_date = req.body.due_date;
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'Nothing to update' });

    const { data: invoice, error } = await supabase.from('invoices')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*, clients(name), jobs(name)')
      .single();
    if (error) throw error;
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ invoice });
  } catch (err) { next(err); }
});

// DELETE /:id — delete invoice
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('invoices').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
