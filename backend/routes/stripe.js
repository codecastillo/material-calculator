const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const supabase = require('../config/database');
const { Resend } = require('resend');
const { createLicenseKey, PLAN_DURATION_DAYS } = require('../lib/keys');

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// Stripe SDK loads lazily so the app still boots if STRIPE_SECRET_KEY isn't set.
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  try {
    const Stripe = require('stripe');
    return new Stripe(process.env.STRIPE_SECRET_KEY);
  } catch (e) {
    console.warn('stripe SDK not installed:', e.message);
    return null;
  }
}

const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  yearly: process.env.STRIPE_PRICE_YEARLY,
  lifetime: process.env.STRIPE_PRICE_LIFETIME,
};

const PLAN_MODES = {
  monthly: 'subscription',
  yearly: 'subscription',
  lifetime: 'payment',
};

// POST /api/stripe/checkout: create a Checkout Session for a plan
// Body: { plan: 'monthly' | 'yearly' | 'lifetime' }
router.post('/checkout', express.json(), async (req, res, next) => {
  try {
    const stripe = getStripe();
    if (!stripe) return res.status(503).json({ error: 'Stripe is not configured' });
    const plan = String((req.body && req.body.plan) || '').toLowerCase();
    const priceId = PRICE_IDS[plan];
    if (!priceId) return res.status(400).json({ error: 'Unknown plan' });

    const base = process.env.APP_BASE_URL || req.protocol + '://' + req.get('host');
    const session = await stripe.checkout.sessions.create({
      mode: PLAN_MODES[plan],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: base + '/landing.html?purchase=success',
      cancel_url: base + '/landing.html#pricing',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: { plan },
    });

    res.json({ url: session.url, id: session.id });
  } catch (err) {
    next(err);
  }
});

// Stripe can retry from many different IPs, so the window and max are generous.
// The goal is blocking floods, not throttling legitimate retries.
const WEBHOOK_RATE_WINDOW_MS = 60 * 1000; // 1 minute
const WEBHOOK_RATE_MAX = 200;

const webhookRateLimit = rateLimit({
  windowMs: WEBHOOK_RATE_WINDOW_MS,
  max: WEBHOOK_RATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/stripe/webhook: handle checkout.session.completed
// Requires STRIPE_WEBHOOK_SECRET; refuses all requests without it so forged
// events cannot bypass signature verification in dev or misconfigured envs.
router.post(
  '/webhook',
  webhookRateLimit,
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const stripe = getStripe();
    if (!stripe) return res.status(503).send('stripe not configured');

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[stripe] STRIPE_WEBHOOK_SECRET is not set; refusing webhook');
      return res.status(503).send('webhook not available');
    }

    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch (err) {
      console.error('[stripe] signature verification failed:', err.message);
      return res.status(400).send('invalid signature');
    }

    if (event.type === 'checkout.session.completed') {
      try {
        const session = event.data.object;
        const stripeSessionId = session.id;

        // Idempotency: skip if we've already created a token for this session.
        const { data: existing } = await supabase
          .from('onboarding_tokens')
          .select('id')
          .eq('stripe_session_id', stripeSessionId)
          .maybeSingle();
        if (existing) {
          return res.json({ received: true, idempotent: true });
        }

        const plan = (session.metadata && session.metadata.plan) || 'monthly';
        const email = session.customer_details && session.customer_details.email;
        if (!email) {
          console.warn('[stripe] no email on session', stripeSessionId);
          return res.json({ received: true, ignored: 'no-email' });
        }

        // Create the license key matching the purchased plan.
        const durationDays = PLAN_DURATION_DAYS[plan];
        const key = await createLicenseKey({
          type: plan,
          duration_days: durationDays,
          max_uses: 1,
          times_used: 0,
          created_by: null,
        });

        // Magic-link token, valid 7 days.
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await supabase.from('onboarding_tokens').insert({
          token,
          email,
          license_key: key.key,
          stripe_session_id: stripeSessionId,
          expires_at: expiresAt,
          used: false,
        });

        // Send the welcome email with the onboarding link.
        const base = process.env.APP_BASE_URL || 'http://localhost:3000';
        const link = base + '/onboard.html?token=' + encodeURIComponent(token);
        const planLabel =
          plan === 'lifetime' ? 'Lifetime' : plan === 'yearly' ? 'Yearly' : 'Monthly';
        try {
          await resend.emails.send({
            from: 'EstiCount <noreply@esticount.com>',
            to: email,
            subject: 'Set up your EstiCount account',
            html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 20px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <tr><td style="background:#1c2128;padding:28px 32px;text-align:center">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px">EstiCount</h1>
          <p style="margin:4px 0 0;color:#8b949e;font-size:13px">${planLabel} plan &middot; ready to set up</p>
        </td></tr>
        <tr><td style="padding:36px 32px 20px">
          <h2 style="margin:0 0 8px;color:#1f2328;font-size:20px;font-weight:600">Welcome to EstiCount</h2>
          <p style="margin:0 0 24px;color:#59636e;font-size:15px;line-height:1.5">Thanks for purchasing the ${planLabel} plan. Click below to finish setting up your account - takes about a minute.</p>
          <p style="text-align:center;margin:0 0 24px">
            <a href="${link}" style="display:inline-block;background:#4493f8;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px">Set up my account</a>
          </p>
          <p style="margin:0 0 6px;color:#59636e;font-size:14px">Or paste this link into your browser:</p>
          <p style="margin:0 0 24px;color:#4493f8;font-size:13px;word-break:break-all">${link}</p>
          <p style="margin:0;color:#8b949e;font-size:13px">This link expires in 7 days. If you have any trouble, reply to this email and we'll help.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
          });
        } catch (mailErr) {
          console.error('[stripe] onboarding email failed:', mailErr.message);
        }
      } catch (err) {
        console.error('[stripe] webhook handler error:', err);
        // Don't 500 (that makes Stripe retry). We've logged it; ack the event.
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;
