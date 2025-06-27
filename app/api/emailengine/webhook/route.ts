/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { sendEventToClients } from '@/app/lib/sse';

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();

    if (!reqBody) {
      console.log('NO REQ BODY');
      return NextResponse.json({ error: 'Missing request body' }, { status: 400 });
    }

    const event = reqBody.event;
    const data = reqBody.data;

    const broadcastLog = (msg: string, data?: any) => {
      sendEventToClients({ time: new Date().toISOString(), msg, data });
    };

    switch (event) {
      case 'messageNew': {
        // const inReplyTo = data.inReplyTo;
        // await SentEmail.findOneAndUpdate(
        //   { 'emails.messageId': inReplyTo },
        //   { 'emails.$.replied': true }
        // );
        broadcastLog('📨 Received reply', data);
        break;
      }

      case 'messageSent': {
        // await SentEmail.findOneAndUpdate(
        //   { 'emails.messageId': data.messageId },
        //   { 'emails.$.sent': true }
        // );
        broadcastLog('✅ Message sent', data);
        break;
      }

      case 'messageFailed': {
        console.log('❌ THE MESSAGE HAS FAILED', data);
        broadcastLog('❌ Message failed', data);
        // await SentEmail.findOneAndUpdate(
        //   { 'emails.messageId': data.messageId },
        //   { 'emails.$.sent': false }
        // );
        break;
      }

      case 'messageBounce': {
        console.log('📛 THE MESSAGE HAS BOUNCED', data);
        // await SentEmail.findOneAndUpdate(
        //   { 'emails.messageId': data.messageId },
        //   { 'emails.$.bounced': true }
        // );
        broadcastLog('📛 Message bounced', data);
        break;
      }

      default: {
        console.warn('Unhandled event:', event);
        broadcastLog(`⚠️ Unhandled event: ${event}`);
        break;
      }
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
