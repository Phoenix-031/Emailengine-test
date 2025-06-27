/* eslint-disable @typescript-eslint/no-explicit-any */
type SSEClient = {
  id: string;
  stream: WritableStreamDefaultWriter;
};

const clients: SSEClient[] = [];

export const addClient = (id: string, stream: WritableStreamDefaultWriter) => {
  clients.push({ id, stream });
};

export const removeClient = (id: string) => {
  const index = clients.findIndex((client) => client.id === id);
  if (index !== -1) {
    clients.splice(index, 1);
  }
};

export const sendEventToClients = (data: any) => {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(async ({ stream }) => {
    try {
      await stream.write(message);
    } catch (e) {
      console.error('Error writing to stream:', e);
    }
  });
};
