// Netlify Function v2.0 - Notion Webhook Handler
// Verifies Notion webhook signatures and triggers Netlify rebuild on content changes.
// Also emails info@sospermesso.it (via Resend) when a new entry lands in the
// watched submission databases (quesiti legali, contatti ricevuti, prassi locali).

import crypto from 'crypto';
import { getStore } from '@netlify/blobs';

// 30-minute debounce window for build triggers
const DEBOUNCE_WINDOW_MS = 30 * 60 * 1000;

// Databases watched for new-entry email notifications. Keys are normalized
// (dashless) IDs; each database is listed under BOTH its database_id and its
// data_source_id because webhook payloads may carry either depending on the
// API version of the subscription.
// NOT watched on purpose: "Risposte APP avere/convertire" (tree analytics).
const WATCHED_DATABASES = {
  // QUESITI LEGALI SOSPERMESSO (app form /contattaci/problema-legale)
  '30d7355e7f7f800cbee7c653dce65f1d': 'Nuovo quesito legale',
  '30d7355e7f7f80728c69000b2d894562': 'Nuovo quesito legale',
  // Contatti ricevuti (app form /contattaci/contribuisci)
  '2f47355e7f7f80a4bed8d867abec2271': 'Nuovo contatto ricevuto',
  '2f47355e7f7f805999e4000bb687d886': 'Nuovo contatto ricevuto',
  // Prassi Locali (site form → submit-prassi function)
  '3027355e7f7f80f6957ec3107a5f7aa4': 'Nuova prassi locale',
  '3027355e7f7f80148d06000b5aa04d2e': 'Nuova prassi locale',
  // Segnalazioni errori ricevute (app form /contattaci/segnala-errore)
  '2f47355e7f7f8072aedcf43229874199': 'Nuova segnalazione errore',
  '2f47355e7f7f804ab4ce000b42f7a827': 'Nuova segnalazione errore',
};

const normalizeId = (id) => (id || '').replace(/-/g, '').toLowerCase();

function formatProperty(prop) {
  switch (prop.type) {
    case 'title': return prop.title.map((t) => t.plain_text).join('');
    case 'rich_text': return prop.rich_text.map((t) => t.plain_text).join('');
    case 'email': return prop.email;
    case 'phone_number': return prop.phone_number;
    case 'url': return prop.url;
    case 'select': return prop.select?.name;
    case 'multi_select': return prop.multi_select.map((o) => o.name).join(', ');
    case 'status': return prop.status?.name;
    case 'date': return prop.date?.start;
    case 'number': return prop.number != null ? String(prop.number) : null;
    case 'checkbox': return prop.checkbox ? 'Sì' : 'No';
    default: return null;
  }
}

async function fetchPageSummary(pageId) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28'
    }
  });
  if (!res.ok) {
    throw new Error(`Notion pages.retrieve failed: ${res.status}`);
  }
  const page = await res.json();
  const lines = [];
  for (const [name, prop] of Object.entries(page.properties || {})) {
    const value = formatProperty(prop);
    if (value) lines.push(`${name}: ${value}`);
  }
  return { lines, url: page.url };
}

async function sendNotificationEmail({ subject, lines, url, pageId }) {
  const to = process.env.NOTIFY_EMAIL || 'info@sospermesso.it';
  const from = process.env.RESEND_FROM || 'SOS Permesso <notifiche@sospermesso.it>';
  const text = [
    subject,
    '',
    ...(lines.length ? lines : ['(contenuto non disponibile — apri la pagina in Notion)']),
    '',
    url ? `Apri in Notion: ${url}` : `Pagina Notion: ${pageId}`,
  ].join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to, subject: `${subject} — SOS Permesso`, text })
  });
  if (!res.ok) {
    throw new Error(`Resend send failed: ${res.status} ${await res.text()}`);
  }
}

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

    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      console.warn('[notion-webhook] Body is not valid JSON');
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Endpoint verification. Notion POSTs { verification_token } once when the
    // subscription is created; that request is UNSIGNED by design (the token it
    // delivers is itself the future signing secret), so it must be handled
    // before the signature check. Copy the logged token into both the Notion UI
    // and the NOTION_WEBHOOK_SECRET env var.
    if (payload.verification_token) {
      console.log('[notion-webhook] Verification token received:', payload.verification_token);
      return new Response(JSON.stringify({ message: 'Verification token received' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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

    // Notion carries the event type at the TOP level of the payload
    // (e.g. "page.created"). The nested { type: 'event', event: { type } }
    // shape is tolerated too, in case a future API version wraps it.
    const eventType = payload.type === 'event' ? payload.event?.type : payload.type;
    console.log('[notion-webhook] Event received:', eventType);

    if (eventType) {
      // Email notification for new entries in watched submission databases
      if (eventType === 'page.created') {
        const parent = payload.data?.parent || {};
        const parentId = normalizeId(parent.id || parent.data_source_id || parent.database_id);
        const subject = WATCHED_DATABASES[parentId];
        const pageId = payload.entity?.id;

        if (!subject || !pageId) {
          console.log('[notion-webhook] page.created ignored (parent not watched):', parentId);
          return new Response(JSON.stringify({ message: 'Event ignored' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        if (!process.env.RESEND_API_KEY) {
          // Permanent misconfiguration: log loudly but return 200 so Notion
          // doesn't retry forever / suspend the subscription.
          console.error('[notion-webhook] RESEND_API_KEY not configured — notification skipped');
          return new Response(JSON.stringify({ error: 'Email not configured' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Dedupe (Notion retries deliveries). Fail open if Blobs unavailable.
        const dedupeKey = `notified-${normalizeId(pageId)}`;
        let store = null;
        try {
          store = getStore('webhook-state');
          if (await store.get(dedupeKey)) {
            console.log('[notion-webhook] Already notified for page:', pageId);
            return new Response(JSON.stringify({ message: 'Already notified' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          await store.set(dedupeKey, new Date().toISOString());
        } catch (blobError) {
          console.warn('[notion-webhook] Blobs unavailable, skipping dedupe:', blobError.message);
        }

        let summary = { lines: [], url: null };
        try {
          summary = await fetchPageSummary(pageId);
        } catch (notionError) {
          // Still notify with just the page link
          console.error('[notion-webhook] Could not fetch page content:', notionError.message);
        }

        try {
          await sendNotificationEmail({ subject, lines: summary.lines, url: summary.url, pageId });
        } catch (emailError) {
          console.error('[notion-webhook] Email send failed:', emailError.message);
          // Clear the dedupe marker and return 500 so Notion retries later
          try { if (store) await store.delete(dedupeKey); } catch { /* best effort */ }
          return new Response(JSON.stringify({ error: 'Email send failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        console.log('[notion-webhook] Notification sent:', subject, pageId);
        return new Response(JSON.stringify({ message: 'Notification sent' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Trigger rebuild for content or schema changes
      if (eventType === 'page.content_updated' || eventType === 'data_source.schema_updated') {
        console.log('[notion-webhook] Content change detected:', eventType);

        // Check debounce window using Netlify Blobs
        const store = getStore('webhook-state');
        const now = new Date();
        const lastTriggerStr = await store.get('last-build-trigger');
        const lastTrigger = lastTriggerStr ? new Date(lastTriggerStr) : null;

        if (lastTrigger && (now - lastTrigger) < DEBOUNCE_WINDOW_MS) {
          const minutesSinceLast = Math.floor((now - lastTrigger) / 60000);
          console.log(`[notion-webhook] Debounced: ${minutesSinceLast}min since last trigger (< 30min)`);
          return new Response(JSON.stringify({
            message: 'Debounced',
            minutes_since_last: minutesSinceLast,
            debounce_window_minutes: 30
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Update timestamp BEFORE triggering build (prevents race condition)
        await store.set('last-build-trigger', now.toISOString());
        console.log('[notion-webhook] Triggering build (30min window passed or first trigger)');

        const buildHookUrl = process.env.NETLIFY_BUILD_HOOK_URL;
        if (!buildHookUrl) {
          console.error('[notion-webhook] NETLIFY_BUILD_HOOK_URL not configured');
          return new Response(JSON.stringify({ error: 'Build hook not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Trigger build with descriptive title
        const buildResponse = await fetch(buildHookUrl, {
          method: 'POST',
          body: JSON.stringify({ trigger_title: 'Notion content updated' })
        });

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
