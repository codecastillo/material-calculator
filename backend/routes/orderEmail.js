const express = require('express');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const supabase = require('../config/database');
const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

// Best-effort: look up the authenticated user's saved company info so the
// letterhead is correct even if the frontend localStorage cache is empty.
// Not gated by authentication — anonymous order sends still work.
async function loadCompanyFromToken(req) {
  try {
    const auth = req.headers && req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return null;
    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    const { data } = await supabase
      .from('users')
      .select(
        'company_name, company_address, company_phone, company_email, contractor_license, name, email'
      )
      .eq('id', decoded.id)
      .single();
    if (!data) return null;
    return {
      name: data.company_name || data.name || '',
      address: data.company_address || '',
      phone: data.company_phone || '',
      email: data.company_email || data.email || '',
      license: data.contractor_license || '',
    };
  } catch (_) {
    return null;
  }
}

function mergeCompany(bodyCompany, dbCompany) {
  if (!dbCompany) return bodyCompany || {};
  const out = { ...dbCompany };
  if (bodyCompany) {
    Object.keys(bodyCompany).forEach((k) => {
      const v = bodyCompany[k];
      if (v != null && String(v).trim() !== '') out[k] = v;
    });
  }
  return out;
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmt(n) {
  return (
    '$' +
    Number(n || 0)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  );
}

function stripCountry(addr) {
  return String(addr || '')
    .replace(/,\s*USA\s*$/i, '')
    .replace(/,\s*United States\s*$/i, '')
    .trim();
}

function buildOrderHtml({
  orderNum,
  project,
  address,
  deliveryNotes,
  company,
  groups,
  materialTotal,
}) {
  const rowsHtml = groups
    .map((g) => {
      const items = (g.items || [])
        .map(
          (i) => `
      <tr>
        <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:12px;color:#374151">${esc(i.sku || '')}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827">${esc(i.name || '')}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:14px;color:#111827">${i.qty} ${esc(i.unit || '')}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:14px;color:#111827">${fmt(i.pricePerUnit)}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:14px;color:#111827;font-weight:600">${fmt(i.lineTotal)}</td>
      </tr>`
        )
        .join('');
      return `
      <div style="margin-bottom:24px">
        <div style="background:#f3f4f6;padding:12px 14px;border-radius:8px 8px 0 0;font-weight:600">
          ${esc(g.supplier)} &middot; ${esc((g.phases || []).join(', '))}
        </div>
        <table style="width:100%;border-collapse:collapse;background:#ffffff">
          <thead>
            <tr style="background:#fafafa">
              <th style="padding:8px 6px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #e5e7eb">SKU</th>
              <th style="padding:8px 6px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #e5e7eb">Item</th>
              <th style="padding:8px 6px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #e5e7eb">Qty</th>
              <th style="padding:8px 6px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #e5e7eb">Each</th>
              <th style="padding:8px 6px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #e5e7eb">Total</th>
            </tr>
          </thead>
          <tbody>${items}</tbody>
        </table>
      </div>`;
    })
    .join('');

  const notesHtml = deliveryNotes
    ? `
    <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;margin:16px 0;border-radius:0 6px 6px 0">
      <div style="font-size:11px;font-weight:600;color:#92400e;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Delivery Notes</div>
      <div style="font-size:14px;color:#451a03;white-space:pre-wrap">${esc(deliveryNotes)}</div>
    </div>`
    : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);max-width:640px">
        <!-- Header -->
        <tr><td style="padding:24px 28px 20px;border-bottom:1px solid #e5e7eb">
          <table width="100%"><tr>
            <td>
              <div style="font-size:18px;font-weight:700;color:#111827">${esc(company.name || 'Material Order')}</div>
              ${company.address ? `<div style="font-size:13px;color:#6b7280;margin-top:2px">${esc(company.address)}</div>` : ''}
              ${company.email ? `<div style="font-size:13px;color:#6b7280;margin-top:2px">${esc(company.email)}</div>` : ''}
              ${company.phone ? `<div style="font-size:13px;color:#6b7280;margin-top:2px">${esc(company.phone)}</div>` : ''}
            </td>
            <td align="right" style="vertical-align:top">
              <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em">Order</div>
              <div style="font-size:20px;font-weight:700;color:#111827;font-family:monospace">${esc(orderNum)}</div>
            </td>
          </tr></table>
        </td></tr>
        <!-- Deliver to -->
        <tr><td style="padding:20px 28px 4px">
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Deliver to</div>
          <div style="font-size:15px;font-weight:600;color:#111827">${esc(project || '—')}</div>
          ${address ? `<div style="font-size:14px;color:#374151;margin-top:2px">${esc(stripCountry(address))}</div>` : ''}
        </td></tr>
        <!-- Notes -->
        <tr><td style="padding:0 28px">${notesHtml}</td></tr>
        <!-- Items -->
        <tr><td style="padding:8px 28px 8px">${rowsHtml}</td></tr>
        <!-- Totals -->
        <tr><td style="padding:16px 28px 28px;border-top:2px solid #e5e7eb">
          <table width="100%">
            <tr>
              <td style="font-size:15px;color:#111827;font-weight:600">Order Total</td>
              <td style="font-size:20px;color:#111827;font-weight:700;text-align:right">${fmt(materialTotal)}</td>
            </tr>
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:16px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center">
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5">
            Please confirm availability and provide an estimated delivery date.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

router.post('/preview', async (req, res, next) => {
  try {
    const { orderNum, project, address, deliveryNotes, company, groups, materialTotal } =
      req.body || {};
    if (!Array.isArray(groups) || !groups.length) {
      return res.status(400).json({ error: 'Order has no items' });
    }
    const dbCompany = await loadCompanyFromToken(req);
    const html = buildOrderHtml({
      orderNum: orderNum || 'Order',
      project: project || '',
      address: address || '',
      deliveryNotes: deliveryNotes || '',
      company: mergeCompany(company, dbCompany),
      groups,
      materialTotal: materialTotal || 0,
    });
    res.json({ html });
  } catch (err) {
    next(err);
  }
});

router.post('/send', async (req, res, next) => {
  try {
    const {
      to,
      subject: customSubject,
      orderNum,
      project,
      address,
      deliveryNotes,
      company,
      groups,
      materialTotal,
    } = req.body || {};
    if (!to || !/.+@.+\..+/.test(to)) {
      return res.status(400).json({ error: 'Valid recipient email required' });
    }
    if (!Array.isArray(groups) || !groups.length) {
      return res.status(400).json({ error: 'Order has no items' });
    }
    const dbCompany = await loadCompanyFromToken(req);
    const mergedCompany = mergeCompany(company, dbCompany);
    const html = buildOrderHtml({
      orderNum: orderNum || 'Order',
      project: project || '',
      address: address || '',
      deliveryNotes: deliveryNotes || '',
      company: mergedCompany,
      groups,
      materialTotal: materialTotal || 0,
    });
    const subject =
      (customSubject && String(customSubject).trim()) ||
      `Material Order — ${orderNum}${project ? ' — ' + project : ''}`;
    const fromName = mergedCompany.name || 'EstiCount';
    await resend.emails.send({
      from: `${fromName} <orders@esticount.com>`,
      to,
      reply_to: mergedCompany.email || undefined,
      subject,
      html,
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
