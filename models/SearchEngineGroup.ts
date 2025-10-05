import mongoose, { Schema, SchemaTypes } from 'mongoose';

interface SearchEngineInput {
  name: string;
  urlTemplate: string;
  order: number;
  isDefault?: boolean;
}

export interface SearchEngineGroupDoc extends mongoose.Document {
  name: string;
  order: number;
  engines: SearchEngineInput[];
  createdAt: Date;
  updatedAt: Date;
}

const engineSchema = new Schema<SearchEngineInput>(
  {
    name: { type: SchemaTypes.String, required: true, trim: true },
    urlTemplate: { type: SchemaTypes.String, required: true, trim: true },
    order: { type: SchemaTypes.Number, default: 0 },
    isDefault: { type: SchemaTypes.Boolean, default: false },
  },
  { _id: false },
);

const searchEngineGroupSchema = new Schema<SearchEngineGroupDoc>(
  {
    name: { type: SchemaTypes.String, required: true, trim: true },
    order: { type: SchemaTypes.Number, default: 0 },
    engines: { type: [engineSchema], default: [] },
  },
  { timestamps: true },
);

const SearchEngineGroup =
  (mongoose.models.SearchEngineGroup as mongoose.Model<SearchEngineGroupDoc>) ||
  mongoose.model<SearchEngineGroupDoc>('SearchEngineGroup', searchEngineGroupSchema);

export default SearchEngineGroup;
