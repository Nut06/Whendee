export async function sendInvitationMessage(params: {
  groupId: string;
  inviterId: string;
  inviteeId: string;
  inviteLink: string;
  expiresAt: Date;
}) {
  console.info('[Notification] send invitation', params);
}

export async function notifyGroupJoined(params: {
  groupId: string;
  inviteeId: string;
}) {
  console.info('[Notification] member joined group', params);
}
