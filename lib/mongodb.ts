import mongoose from 'mongoose';

const getMongoUri = () => process.env.MONGODB_URI || '';

if (!getMongoUri() && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️  警告: MONGODB_URI 未设置，请在 .env.local 文件中配置');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  const uri = getMongoUri();

  if (!uri) {
    throw new Error('请在 .env.local 文件中定义 MONGODB_URI 环境变量');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then(m => {
      console.log('✅ MongoDB 连接成功');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB 连接失败:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
