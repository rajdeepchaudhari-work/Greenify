import { Schema, model, InferSchemaType } from 'mongoose';

const ProjectSchema = new Schema(
  {
    projectId: { type: Number, required: true, unique: true, index: true },
    owner: { type: String, required: true, lowercase: true, index: true },
    ipfsCid: { type: String, required: true },
    approved: { type: Boolean, default: false },
    totalIssued: { type: String, default: '0' },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export type ProjectDoc = InferSchemaType<typeof ProjectSchema>;
export const Project = model('Project', ProjectSchema);
