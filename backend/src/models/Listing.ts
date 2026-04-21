import { Schema, model, InferSchemaType } from 'mongoose';

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

export type ListingDoc = InferSchemaType<typeof ListingSchema>;
export const Listing = model('Listing', ListingSchema);
