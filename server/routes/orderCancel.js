import express from 'express';

const CANCEL_DENIED =
  'Order can no longer be cancelled because it is already being processed';

function normalizePhone(p) {
  return String(p || '')
    .replace(/\s/g, '')
    .trim();
}

/**
 * POST /api/orders/cancel — customer cancellation (atomic: only while status is pending).
 * Uses service role to bypass RLS; ownership verified against JWT user.
 */
export default function createOrderCancelRouter({ supabase, supabaseAdmin }) {
  const router = express.Router();

  router.post('/cancel', async (req, res) => {
    try {
      const { orderId } = req.body || {};
      const authHeader = req.headers.authorization;

      if (!orderId || typeof orderId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Order ID is required.',
        });
      }
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Please sign in to cancel an order.',
        });
      }
      if (!supabase || !supabaseAdmin) {
        return res.status(503).json({
          success: false,
          error: 'Service unavailable.',
        });
      }

      const token = authHeader.slice(7);
      const { data: userData, error: userErr } = await supabase.auth.getUser(token);
      if (userErr || !userData?.user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired session.',
        });
      }

      const user = userData.user;
      const email = (user.email || '').toLowerCase();

      const { data: order, error: fetchErr } = await supabaseAdmin
        .from('orders')
        .select('id, customer_email, customer_phone, status')
        .eq('id', orderId)
        .single();

      if (fetchErr || !order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found.',
        });
      }

      const orderEmail = (order.customer_email || '').toLowerCase();
      const emailMatch =
        Boolean(orderEmail) && Boolean(email) && orderEmail === email;

      const metaPhone = user.user_metadata?.phone;
      const uPhone = normalizePhone(user.phone || metaPhone);
      const oPhone = normalizePhone(order.customer_phone);
      const phoneMatch =
        Boolean(uPhone) && Boolean(oPhone) && uPhone === oPhone;

      if (!emailMatch && !phoneMatch) {
        return res.status(403).json({
          success: false,
          error: 'You are not allowed to cancel this order.',
        });
      }

      const now = new Date().toISOString();

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('orders')
        .update({ status: 'cancelled', updated_at: now })
        .eq('id', orderId)
        .eq('status', 'pending')
        .select('id')
        .maybeSingle();

      if (updateErr) {
        console.error('order cancel update error', updateErr);
        return res.status(500).json({
          success: false,
          error: 'Could not cancel order. Please try again.',
        });
      }

      if (!updated) {
        return res.status(409).json({
          success: false,
          error: CANCEL_DENIED,
        });
      }

      return res.json({ success: true, data: { ok: true } });
    } catch (e) {
      console.error('POST /api/orders/cancel', e);
      return res.status(500).json({
        success: false,
        error: 'Could not cancel order.',
      });
    }
  });

  return router;
}
