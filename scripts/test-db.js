const mongoose = require('mongoose');

const connections = [
  'mongodb://NavGo:3afnijdxHaMrJHsT@39.98.161.189:27017/NavGo?authSource=admin',
  'mongodb://NavGo:3afnijdxHaMrJHsT@39.98.161.189:27017/NavGo',
  'mongodb://NavGo:3afnijdxHaMrJHsT@39.98.161.189:27017/NavGo?authSource=NavGo',
];

async function testConnection(uri, index) {
  console.log(`\n娴嬭瘯杩炴帴 ${index + 1}:`);
  console.log(uri);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('鉁?杩炴帴鎴愬姛锛?);
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log('鉂?杩炴帴澶辫触:', error.message);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    return false;
  }
}

async function main() {
  console.log('馃攳 寮€濮嬫祴璇昅ongoDB杩炴帴...\n');

  for (let i = 0; i < connections.length; i++) {
    const success = await testConnection(connections[i], i);
    if (success) {
      console.log('\n鉁?鎵惧埌鍙敤杩炴帴锛佽浣跨敤姝よ繛鎺ュ瓧绗︿覆銆?);
      process.exit(0);
    }
  }

  console.log('\n鉂?鎵€鏈夎繛鎺ュ皾璇曞潎澶辫触銆傝妫€鏌?');
  console.log('1. MongoDB鏈嶅姟鏄惁杩愯');
  console.log('2. 鐢ㄦ埛鍚嶅瘑鐮佹槸鍚︽纭?);
  console.log('3. 缃戠粶杩炴帴鏄惁姝ｅ父');
  console.log('4. 闃茬伀澧欒缃?);
  process.exit(1);
}

main();

