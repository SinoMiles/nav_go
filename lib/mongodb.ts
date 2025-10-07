import mongoose from 'mongoose';

const getMongoUri = () => process.env.MONGODB_URI || '';

if (!getMongoUri() && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️  提示: 未检测到 MONGODB_URI，请在 .env.local 文件中配置连接字符串');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

let ensuredIndexes = false;

const ensureIndexes = async () => {
  if (ensuredIndexes) return;
  try {
    const [{ default: Category }, { default: LinkItem }, { default: Theme }] = await Promise.all([
      import('@/models/Category'),
      import('@/models/LinkItem'),
      import('@/models/Theme'),
    ]);
    await Promise.all([
      Category.syncIndexes(),
      LinkItem.syncIndexes(),
      Theme.syncIndexes(),
    ]);
    ensuredIndexes = true;
  } catch (error) {
    console.warn('索引同步时出现警告，可忽略开发期提示:', error);
  }
};

async function connectDB(): Promise<typeof mongoose> {
  const uri = getMongoUri();

  if (!uri) {
    throw new Error('请在 .env.local 文件中配置 MONGODB_URI 环境变量');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then(async m => {
      console.log('✅ MongoDB 连接成功');
      await ensureIndexes();
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
