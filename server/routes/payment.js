import express from 'express';
import crypto from 'crypto';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const toPesewas = (amount) => Math.round(Number(amount) * 100);

const updateOrderAsPaid = async (supabaseAdmin, orderId, reference) => {
  if (!orderId) return;

  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    throw new Error(`Failed to update order as paid: ${error.message}`);
  }
};

export default function createPaymentRouter({ supabaseAdmin }) {
  const router = express.Router();

  router.post('/initialize', async (req, res) => {
    try {
      const { email, amount, orderId, cartItems } = req.body;
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

      if (!secretKey) {
        return res.status(500).json({
          success: false,
          message: 'PAYSTACK_SECRET_KEY is not configured',
        });
      }

      if (!email || amount === undefined || !orderId || !Array.isArray(cartItems)) {
        return res.status(400).json({
          success: false,
          message: 'email, amount, orderId and cartItems are required',
        });
      }

      const amountInPesewas = toPesewas(amount);
      if (!Number.isFinite(amountInPesewas) || amountInPesewas <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount',
        });
      }

      const callbackBase = frontendUrl.replace(/\/$/, '');
      const paystackResponse = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: amountInPesewas,
          callback_url: `${callbackBase}/payment/verify`,
          metadata: {
            orderId,
            cartItems,
          },
        }),
      });

      const paystackData = await paystackResponse.json();
      if (!paystackResponse.ok || !paystackData?.status || !paystackData?.data) {
        return res.status(400).json({
          success: false,
          message: paystackData?.message || 'Failed to initialize payment',
        });
      }

      return res.json({
        success: true,
        authorization_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
      });
    } catch (error) {
      console.error('❌ Payment initialize error:', error);
      return res.status(500).json({
        success: false,
        message: 'Could not initialize payment',
      });
    }
  });

  router.get('/verify/:reference', async (req, res) => {
    try {
      const { reference } = req.params;
      const secretKey = process.env.PAYSTACK_SECRET_KEY;

      if (!secretKey) {
        return res.status(500).json({
          success: false,
          message: 'PAYSTACK_SECRET_KEY is not configured',
        });
      }

      if (!reference) {
        return res.status(400).json({
          success: false,
          message: 'Payment reference is required',
        });
      }

      const paystackResponse = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      });

      const paystackData = await paystackResponse.json();
      if (!paystackResponse.ok || !paystackData?.status || !paystackData?.data) {
        return res.status(400).json({
          success: false,
          message: paystackData?.message || 'Could not verify payment',
        });
      }

      const transactionData = paystackData.data;
      const orderId = transactionData?.metadata?.orderId;

      if (transactionData.status === 'success') {
        try {
          await updateOrderAsPaid(supabaseAdmin, orderId, reference);
        } catch (updateError) {
          console.error('❌ Order update after verify failed:', updateError);
        }

        return res.json({
          success: true,
          orderId,
          reference,
        });
      }

      return res.status(400).json({
        success: false,
        message: transactionData.gateway_response || 'Payment not successful',
      });
    } catch (error) {
      console.error('❌ Payment verify error:', error);
      return res.status(500).json({
        success: false,
        message: 'Could not verify payment',
      });
    }
  });

  router.post('/webhook', async (req, res) => {
    try {
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!secretKey) {
        return res.status(500).send('PAYSTACK_SECRET_KEY is not configured');
      }

      const signature = req.get('x-paystack-signature');
      const bodyBuffer = Buffer.isBuffer(req.rawBody)
        ? req.rawBody
        : Buffer.from(JSON.stringify(req.body || {}), 'utf8');
      const hash = crypto
        .createHmac('sha512', secretKey)
        .update(bodyBuffer)
        .digest('hex');

      if (!signature || signature !== hash) {
        return res.status(401).send('Invalid signature');
      }

      const event = JSON.parse(bodyBuffer.toString('utf8'));
      if (event?.event === 'charge.success') {
        const orderId = event?.data?.metadata?.orderId;
        const reference = event?.data?.reference;
        try {
          await updateOrderAsPaid(supabaseAdmin, orderId, reference);
        } catch (updateError) {
          console.error('❌ Webhook order update failed:', updateError);
        }
      }

      return res.status(200).send('OK');
    } catch (error) {
      console.error('❌ Paystack webhook error:', error);
      return res.status(500).send('Webhook processing failed');
    }
  });

  return router;
}
