// Netlify Function v2.0 - Notion Webhook Handler
// Verifies Notion webhook signatures and triggers Netlify rebuild on content changes

import crypto from 'crypto';

export default async (req, context) => {
  // Only accept POST method
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Read raw body
    const body = await req.text();

    // Get signature from header
    const signature = req.headers.get('x-notion-signature');
    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify signature
    const secret = process.env.NOTION_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[notion-webhook] NOTION_WEBHOOK_SECRET not configured');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      console.warn('[notion-webhook] Invalid signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse payload
    const payload = JSON.parse(body);
    console.log('[notion-webhook] Event received:', payload.type, payload.event?.type || '');

    // Handle verification challenge
    if (payload.type === 'url_verification') {
      console.log('[notion-webhook] Verification challenge received');
      return new Response(JSON.stringify({ challenge: payload.challenge }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle content update events
    if (payload.type === 'event') {
      const eventType = payload.event?.type;

      // Trigger rebuild for content or schema changes
      if (eventType === 'page.content_updated' || eventType === 'data_source.schema_updated') {
        console.log('[notion-webhook] Triggering Netlify rebuild for event:', eventType);

        const buildHookUrl = process.env.NETLIFY_BUILD_HOOK_URL;
        if (!buildHookUrl) {
          console.error('[notion-webhook] NETLIFY_BUILD_HOOK_URL not configured');
          return new Response(JSON.stringify({ error: 'Build hook not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Trigger build
        const buildResponse = await fetch(buildHookUrl, { method: 'POST' });

        if (!buildResponse.ok) {
          console.error('[notion-webhook] Build trigger failed:', buildResponse.status);
          return new Response(JSON.stringify({ error: 'Build trigger failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        console.log('[notion-webhook] Build triggered successfully');
        return new Response(JSON.stringify({ message: 'Build triggered' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Ignore other event types
      console.log('[notion-webhook] Event ignored:', eventType);
      return new Response(JSON.stringify({ message: 'Event ignored' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Unknown payload type
    console.warn('[notion-webhook] Unknown payload type:', payload.type);
    return new Response(JSON.stringify({ message: 'Unknown event type' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[notion-webhook] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
