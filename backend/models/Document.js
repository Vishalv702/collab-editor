import { Schema, model } from 'mongoose';

const versionSchema = new Schema({
  content:  { type: Object, required: true },
  savedAt:  { type: Date, default: Date.now },
  savedBy:  { type: String, default: 'auto' },
});

const documentSchema = new Schema(
  {
    _id:      { type: String, required: true },
    title:    { type: String, default: 'Untitled Document', trim: true },
    content:  { type: Object, default: { ops: [{ insert: '\n' }] } },
    yjsState: { type: String, default: null },
    versions: { type: [versionSchema], default: [] },
  },
  { timestamps: true, _id: false }
);

// Keep last 20 versions (ring buffer)
documentSchema.methods.saveVersion = function (content, savedBy = 'auto') {
  this.versions.push({ content, savedAt: new Date(), savedBy });
  if (this.versions.length > 20) this.versions = this.versions.slice(-20);
};

export default model('Document', documentSchema);
