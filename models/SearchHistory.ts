import mongoose, { Schema, Document } from 'mongoose';

export interface ISearchHistory extends Document {
  userId?: mongoose.Types.ObjectId;
  keyword: string;
  searchedAt: Date;
}

const SearchHistorySchema = new Schema<ISearchHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  keyword: {
    type: String,
    required: true,
    trim: true,
  },
  searchedAt: {
    type: Date,
    default: Date.now,
  },
});

SearchHistorySchema.index({ userId: 1, searchedAt: -1 });
SearchHistorySchema.index({ keyword: 1 });

export default mongoose.models.SearchHistory || mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);
