import twilio from 'twilio';

// Twilio client instance
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: twilio.Twilio | null = null;

/**
 * Initialize Twilio client
 */
export function getTwilioClient(): twilio.Twilio {
  if (!twilioClient) {
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured in environment variables');
    }
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

/**
 * Send SMS via Twilio
 * @param phoneNumber - Recipient phone number (format: +66XXXXXXXXX)
 * @param message - SMS message content
 */
export async function sendSMS(
  phoneNumber: string,
  message: string
): Promise<void> {
  // Development mode: Mock SMS sending
  if (process.env.NODE_ENV === 'development') {
    console.log('📱 [MOCK SMS] To:', phoneNumber);
    console.log('📱 [MOCK SMS] Message:', message);
    console.log('📱 [MOCK SMS] Sent successfully (development mode)');
    return;
  }

  // Production mode: Actually send SMS
  try {
    if (!twilioPhoneNumber) {
      throw new Error('TWILIO_PHONE_NUMBER not configured');
    }

    const client = getTwilioClient();
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber
    });

    console.log('✅ SMS sent successfully:', result.sid);
  } catch (error: any) {
    console.error('❌ Failed to send SMS:', error.message);
    throw new Error(`SMS sending failed: ${error.message}`);
  }
}

/**
 * Send OTP SMS
 * @param phoneNumber - Recipient phone number
 * @param otp - 6-digit OTP code
 */
export async function sendOTPSMS(
  phoneNumber: string,
  otp: string
): Promise<void> {
  const message = `Your Whendee verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nDo not share this code with anyone.`;
  await sendSMS(phoneNumber, message);
}