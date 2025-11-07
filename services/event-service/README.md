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
  "title": "ISE Networking Night",
  "eventDescription": "Meet and greet for 2025 class",
  "repeat": "Every Friday",
  "budget": 15000,
  "alertMinutes": 30,
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

### Manage members (post-invite acceptance)

```
POST /events/:eventId/members
Content-Type: application/json

{
  "memberId": "user_789",
  "status": "ACCEPTED"   // optional, defaults to ACCEPTED
}
```

- Adds or updates the membership row once a user accepts an invite.
- Use the invite/accept flow to register members before they can vote or propose locations.

```
GET /events/:eventId/members
```

Returns

```json
{
  "data": [
    { "memberId": "user_123", "status": "ACCEPTED", "joinedAt": "2025-05-01T10:00:00.000Z" }
  ]
}
```

### Poll endpoints (UC-6)

#### Create poll for event (location voting)

```
POST /events/:eventId/poll
Content-Type: application/json

{
  "closesAt": "2025-06-02T12:00:00.000Z",
  "options": [
    { "label": "Downtown Cafe" },
    { "label": "Rooftop Bar" }
  ]
}
```

- `201 Created` → returns the full poll with options (array may be empty if you want members to add their own suggestions later)

#### Add option to existing poll

```
POST /events/:eventId/poll/options
Content-Type: application/json

{ "label": "Late Option", "memberId": "user_abc", "order": 99 }
```

Adds an option while the poll is still open. `memberId` must belong to an accepted event member. `order` is optional (auto-increments).

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
- `409 Conflict` → member already voted or poll is tied and needs organiser decision.
- Only accepted members may vote, and each member can vote for exactly one option.

#### Close poll

```
POST /events/:eventId/poll/close
Content-Type: application/json

{ "finalOptionId": "opt_a" }   // optional; required when tie exists
```

- `200 OK` → poll closed, payload mirrors `GET /poll`.
- `409 Conflict` → tie detected, response includes `tiedOptionIds` array (provide one of them in `finalOptionId` to resolve).
- When a winner is determined, the Event's `location` field is updated to match the winning option's label automatically.

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
