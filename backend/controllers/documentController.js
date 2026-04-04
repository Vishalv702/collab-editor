import { v4 as uuidv4 } from 'uuid';
import Document from '../models/Document.js';

// POST /api/documents
export const createDocument = async (req, res, next) => {
  try {
    const doc = new Document({
      _id: uuidv4(),
      title: req.body.title || 'Untitled Document',
    });

    await doc.save();

    res.status(201).json({
      id: doc._id,
      title: doc.title,
      createdAt: doc.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/documents/:id
export const getDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    let doc = await Document.findById(id);

    if (!doc) {
      doc = new Document({ _id: id });
      await doc.save();
    }

    res.json({
      id: doc._id,
      title: doc.title,
      content: doc.content,
      yjsState: doc.yjsState,
      updatedAt: doc.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/documents/:id/versions
export const getVersions = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id).select('versions title');

    if (!doc) return res.status(404).json({ error: 'Document not found' });

    res.json({ versions: doc.versions });
  } catch (err) {
    next(err);
  }
};