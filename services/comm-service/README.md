# Communication Service

Handles UC-3 "Invite Friends" flow: listing invite targets, creating invitation links, sending notifications, and processing accept/decline actions.

## Run locally

```bash
pnpm install
cp .env.example .env
pnpm --filter comm-service prisma:generate           # once after schema changes
pnpm --filter comm-service prisma:migrate dev --name init-comm
pnpm --filter comm-service dev
```

> Prisma needs internet to download the engine on the first run.

## Key endpoints

### GET /groups/:groupId/invite-targets
Returns candidate friends for the group (mock data for now).

### POST /groups/:groupId/invitations
Payload:
```json
{
  "inviterId": "user_organizer_1",
  "inviteeId": "user_friend_2",
  "expiresInMinutes": 120
}
```
Response `201`:
```json
{
  "message": "Invitation created",
  "data": {
    "inviteCode": "1a2b-...",
    "inviteLink": "https://whendee.app/invite/1a2b-...",
    "expiresAt": "2025-02-01T12:00:00.000Z"
  }
}
```

### GET /invitations/:inviteCode
Returns invitation status (used when opening the invite link).

### POST /invitations/:inviteCode/accept
Optional body `{ "inviteeId": "user_friend_2" }`. Marks invitation as accepted, triggers a group-joined notification stub, returns `groupId`.

### POST /invitations/:inviteCode/decline
Optional body `{ "inviteeId": "user_friend_2" }`. Marks invitation as declined.

## Data model

`Invitation` table stores invite metadata, link code, expiration and status (`PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`). Prisma schema lives at `prisma/schema.prisma`.

## Integration stubs

- `sendInvitationMessage` – in `src/server/services/notification.service.ts`, currently logs to console.
- `notifyGroupJoined` – placeholder for notifying the event group after acceptance.

## Next steps

- Replace mock invite targets with real friend list from identity/event service.
- Connect notification stubs to LINE / Firebase Cloud Messaging.
- Add background job to mark expired invitations periodically.
- Extend validation to ensure inviter has rights for the specific group.
