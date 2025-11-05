// Placeholder implementations for real-time updates or external integrations.
// Replace with message queue, WebSocket, or notification service when available.

export async function publishTallyUpdate(params: {
  eventId: string;
  pollId: string;
  tallies: Array<{ optionId: string; tally: number }>;
}) {
  console.info('[PollNotifier] tally update', params);
}

export async function publishPollClosed(params: {
  eventId: string;
  pollId: string;
  winnerOptionId: string;
}) {
  console.info('[PollNotifier] poll closed', params);
}
