import mongoose, { Schema, InferSchemaType } from 'mongoose';

const ProjectSchema = new Schema(
  {
    projectId: { type: Number, required: true, unique: true, index: true },
    owner: { type: String, required: true, lowercase: true, index: true },
    ipfsCid: { type: String, required: true },
    approved: { type: Boolean, default: false },
    totalIssued: { type: String, default: '0' },
  },
  { timestamps: true },
);

const ListingSchema = new Schema(
  {
    listingId: { type: Number, required: true, unique: true, index: true },
    seller: { type: String, required: true, lowercase: true, index: true },
    projectId: { type: Number, required: true, index: true },
    amount: { type: String, required: true },
    pricePerUnit: { type: String, required: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

const MetaSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export type ProjectDoc = InferSchemaType<typeof ProjectSchema>;
export type ListingDoc = InferSchemaType<typeof ListingSchema>;

export const Project = mongoose.models.Project ?? mongoose.model('Project', ProjectSchema);
export const Listing = mongoose.models.Listing ?? mongoose.model('Listing', ListingSchema);
export const Meta = mongoose.models.Meta ?? mongoose.model('Meta', MetaSchema);
