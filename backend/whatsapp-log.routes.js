/**
 * WhatsApp Log — Endpoints Node.js / Express
 * ------------------------------------------
 * Routes attendues par le frontend (src/services/api.ts → whatsappLogApi) :
 *
 *   GET    /api/whatsapp-log?eventId=<id>   → liste des entrées (filtre optionnel)
 *   POST   /api/whatsapp-log                → upsert d'une action (copied | sent)
 *                                             Header: Idempotency-Key: <uuid>
 *   DELETE /api/whatsapp-log?eventId=<id>   → suppression (scopée ou globale)
 *
 * Modèle de données (table `whatsapp_logs`) :
 *   - id              UUID PK
 *   - event_id        UUID NOT NULL
 *   - guest_id        UUID NOT NULL
 *   - guest_name      TEXT NOT NULL
 *   - copy_count      INT  DEFAULT 0
 *   - send_count      INT  DEFAULT 0
 *   - copied_at       TIMESTAMPTZ NULL
 *   - sent_at         TIMESTAMPTZ NULL
 *   - last_idem_key   TEXT NULL          ← clé d'idempotence du dernier write
 *   - created_at      TIMESTAMPTZ DEFAULT NOW()
 *   - updated_at      TIMESTAMPTZ DEFAULT NOW()
 *   UNIQUE (event_id, guest_id)
 *
 * Idempotence :
 *   Le client envoie un header `Idempotency-Key`. Si la clé reçue est égale à
 *   `last_idem_key` enregistrée pour (event_id, guest_id), on NE ré-incrémente
 *   PAS les compteurs et on renvoie l'état courant (no-op idempotent).
 *
 * Auth : middleware `requireAuth` (à brancher selon votre stack JWT).
 *
 * --------------------------------------------------------------------
 *  Migration SQL (PostgreSQL) — à exécuter une fois :
 * --------------------------------------------------------------------
 *
 *  CREATE TABLE IF NOT EXISTS whatsapp_logs (
 *    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *    event_id      UUID NOT NULL,
 *    guest_id      UUID NOT NULL,
 *    guest_name    TEXT NOT NULL,
 *    copy_count    INTEGER NOT NULL DEFAULT 0,
 *    send_count    INTEGER NOT NULL DEFAULT 0,
 *    copied_at     TIMESTAMPTZ,
 *    sent_at       TIMESTAMPTZ,
 *    last_idem_key TEXT,
 *    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *    CONSTRAINT whatsapp_logs_event_guest_unique UNIQUE (event_id, guest_id)
 *  );
 *  CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_event ON whatsapp_logs(event_id);
 *
 * --------------------------------------------------------------------
 */

const express = require('express');
const { Pool } = require('pg');

const router = express.Router();

// Adaptez la connexion à votre projet (ou injectez le pool depuis l'extérieur)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ---- Helpers ------------------------------------------------------------

const toDTO = (row) => ({
  guestId: row.guest_id,
  guestName: row.guest_name,
  eventId: row.event_id,
  copiedAt: row.copied_at ? new Date(row.copied_at).toISOString() : undefined,
  sentAt: row.sent_at ? new Date(row.sent_at).toISOString() : undefined,
  copyCount: row.copy_count ?? 0,
  sendCount: row.send_count ?? 0,
});

// Stub d'auth — remplacez par votre middleware réel.
const requireAuth = (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
  // TODO: vérifier le JWT et hydrater req.user
  next();
};

// ---- GET /api/whatsapp-log ---------------------------------------------
router.get('/whatsapp-log', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.query;
    const { rows } = eventId
      ? await pool.query(
          'SELECT * FROM whatsapp_logs WHERE event_id = $1 ORDER BY updated_at DESC',
          [eventId],
        )
      : await pool.query('SELECT * FROM whatsapp_logs ORDER BY updated_at DESC');

    res.json({ success: true, data: rows.map(toDTO) });
  } catch (err) {
    console.error('[whatsapp-log][GET]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ---- POST /api/whatsapp-log --------------------------------------------
// Body: { eventId, guestId, guestName, action: 'copied' | 'sent' }
// Header: Idempotency-Key: <uuid>
router.post('/whatsapp-log', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { eventId, guestId, guestName, action } = req.body || {};
    const idemKey = req.header('Idempotency-Key') || null;

    if (!eventId || !guestId || !guestName || !['copied', 'sent'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    await client.query('BEGIN');

    // Verrouille la ligne existante pour éviter les races (clic rapide)
    const existing = await client.query(
      'SELECT * FROM whatsapp_logs WHERE event_id = $1 AND guest_id = $2 FOR UPDATE',
      [eventId, guestId],
    );

    let row;
    if (existing.rowCount === 0) {
      // INSERT initial
      const insert = await client.query(
        `INSERT INTO whatsapp_logs
          (event_id, guest_id, guest_name,
           copy_count, send_count, copied_at, sent_at, last_idem_key)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          eventId,
          guestId,
          guestName,
          action === 'copied' ? 1 : 0,
          action === 'sent' ? 1 : 0,
          action === 'copied' ? new Date() : null,
          action === 'sent' ? new Date() : null,
          idemKey,
        ],
      );
      row = insert.rows[0];
    } else {
      const current = existing.rows[0];

      // Idempotence : si la même clé arrive 2x, on NE fait rien.
      if (idemKey && current.last_idem_key === idemKey) {
        await client.query('COMMIT');
        return res.json({ success: true, data: toDTO(current) });
      }

      const update = await client.query(
        `UPDATE whatsapp_logs SET
            guest_name    = $3,
            copy_count    = copy_count + CASE WHEN $4 = 'copied' THEN 1 ELSE 0 END,
            send_count    = send_count + CASE WHEN $4 = 'sent'   THEN 1 ELSE 0 END,
            copied_at     = CASE WHEN $4 = 'copied' THEN NOW() ELSE copied_at END,
            sent_at       = CASE WHEN $4 = 'sent'   THEN NOW() ELSE sent_at   END,
            last_idem_key = $5,
            updated_at    = NOW()
          WHERE event_id = $1 AND guest_id = $2
          RETURNING *`,
        [eventId, guestId, guestName, action, idemKey],
      );
      row = update.rows[0];
    }

    await client.query('COMMIT');
    res.json({ success: true, data: toDTO(row) });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[whatsapp-log][POST]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
});

// ---- DELETE /api/whatsapp-log ------------------------------------------
router.delete('/whatsapp-log', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.query;
    if (eventId) {
      await pool.query('DELETE FROM whatsapp_logs WHERE event_id = $1', [eventId]);
    } else {
      await pool.query('DELETE FROM whatsapp_logs');
    }
    res.json({ success: true, data: { message: 'Cleared' } });
  } catch (err) {
    console.error('[whatsapp-log][DELETE]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

/**
 * --------------------------------------------------------------------
 * Branchement dans votre app Express :
 *
 *   const whatsappLogRoutes = require('./routes/whatsapp-log.routes');
 *   app.use('/api', whatsappLogRoutes);
 *
 * Test rapide (curl) :
 *
 *   curl -X POST http://localhost:5000/api/whatsapp-log \
 *     -H "Authorization: Bearer <token>" \
 *     -H "Content-Type: application/json" \
 *     -H "Idempotency-Key: 11111111-1111-1111-1111-111111111111" \
 *     -d '{"eventId":"E1","guestId":"G1","guestName":"Alice","action":"copied"}'
 *
 * Rejouer la même requête avec la même Idempotency-Key NE ré-incrémente PAS
 * `copy_count` — c'est le comportement attendu par le frontend.
 * --------------------------------------------------------------------
 */
