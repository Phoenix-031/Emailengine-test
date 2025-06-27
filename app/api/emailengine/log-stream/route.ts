import { NextRequest } from 'next/server';
import { addClient, removeClient } from '@/app/lib/sse';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  const id = uuidv4();

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Initial headers
  writer.write('retry: 10000\n\n');

  addClient(id, writer);

  req.signal.addEventListener('abort', () => {
    removeClient(id);
    writer.close();
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
