# Event Service

Implements **UC-2 Create Event**. Incoming requests go through user validation (identity service) and event data validation before persisting the event record.

## Run locally

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate        # needs internet access the first time (downloads Prisma engine)
pnpm dev                    # ts-node + nodemon
```

> **Note:** `prisma:generate` only prepares the client. Run `pnpm prisma:migrate` after you define migrations.

## HTTP contract

```
POST /events
Content-Type: application/json

{
  "organizerId": "user_123",
  "title": "ISE Networking Night",
  "description": "Meet and greet for 2025 class",
  "location": "Innovation Hub",
  "startsAt": "2025-05-01T18:00:00.000Z",
  "endsAt": "2025-05-01T21:00:00.000Z",
  "capacity": 120
}
```

### Responses

- `201 Created`

  ```json
  {
    "message": "Event created successfully",
    "data": { "eventId": "evt_123" }
  }
  ```

- `401 Unauthorized` → user not found / inactive.
- `400 Bad Request` → invalid event payload.
- `503/504` → identity service offline or timed out.

### Poll endpoints (UC-6)

#### Get poll by event

```
GET /events/:eventId/poll
```

Returns `200` with

```json
{
  "data": {
    "id": "poll_123",
    "eventId": "evt_123",
    "status": "OPEN",
    "closesAt": null,
    "winnerOptionId": null,
    "options": [
      { "id": "opt_a", "label": "Option A", "tally": 10, "order": 0 },
      { "id": "opt_b", "label": "Option B", "tally": 4, "order": 1 }
    ]
  }
}
```

#### Submit vote

```
POST /events/:eventId/poll/votes
Content-Type: application/json

{ "optionId": "opt_a", "voterId": "user_abc" }
```

- `202 Accepted` → vote stored, response contains updated tallies.
- `409 Conflict` → user already voted or poll is tied and needs organiser decision.

#### Close poll

```
POST /events/:eventId/poll/close
Content-Type: application/json

{ "finalOptionId": "opt_a" }   // optional; required when tie exists
```

- `200 OK` → poll closed, payload mirrors `GET /poll`.
- `409 Conflict` → tie detected, response includes `tiedOptionIds` array (provide one of them in `finalOptionId` to resolve).

## Environment variables

| Name | Required | Description |
| --- | --- | --- |
| `PORT` | optional | HTTP port (defaults 3001). |
| `DATABASE_URL` | ✅ | Postgres connection string for Prisma. |
| `USER_SERVICE_URL` | ✅ (when validation enabled) | Base URL for identity service (e.g. `http://localhost:3002`). |
| `USER_SERVICE_TIMEOUT_MS` | optional | Timeout for identity check (default 3000). |
| `SKIP_USER_VALIDATION` | optional | Set `true` during local development to bypass remote validation. |

## Sequence alignment

1. **submitEvent** → `POST /events`
2. **validateUser** → `GET {USER_SERVICE_URL}/internal/users/{organizerId}`
3. **validateEvent** → Zod schema in `src/server/validators/create-event.schema.ts`
4. **saveEvent** → Prisma `event.create`
5. **saveSuccess** → response payload with `eventId`

## Next steps

- Build migrations + seed data for the `Event` model.
- Add endpoints to create/manage polls (current implementation expects poll + options already present in DB).
- Implement `GET /events/:id` and listing endpoints.
- Connect with actual user service contract (currently expects JSON with either `isActive: true` or `status: "active|verified|approved"`).
- Replace `publishTallyUpdate` / `publishPollClosed` with actual real-time or message queue integrations.
