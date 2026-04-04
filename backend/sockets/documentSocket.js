import Document from '../models/Document.js';

const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] connect ${socket.id}`);

    socket.on('join-document', async ({ documentId, user }) => {
      socket.join(documentId);

      let doc = await Document.findById(documentId);

      if (!doc) {
        doc = new Document({ _id: documentId });
        await doc.save();
      }

      socket.emit('load-document', {
        content: doc.content,
        yjsState: doc.yjsState,
      });
    });

    socket.on('save-document', async ({ documentId, content, yjsState }) => {
      const doc = await Document.findById(documentId);
      if (!doc) return;

      doc.content = content;
      doc.yjsState = yjsState;
      await doc.save();
    });
  });
};

export { registerSocketHandlers };