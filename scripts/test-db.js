const mongoose = require('mongoose');

const connections = [
  'mongodb://NavCraft:3afnijdxHaMrJHsT@39.98.161.189:27017/navcraft?authSource=admin',
  'mongodb://NavCraft:3afnijdxHaMrJHsT@39.98.161.189:27017/navcraft',
  'mongodb://NavCraft:3afnijdxHaMrJHsT@39.98.161.189:27017/navcraft?authSource=navcraft',
];

async function testConnection(uri, index) {
  console.log(`\n测试连接 ${index + 1}:`);
  console.log(uri);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ 连接成功！');
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log('❌ 连接失败:', error.message);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    return false;
  }
}

async function main() {
  console.log('🔍 开始测试MongoDB连接...\n');

  for (let i = 0; i < connections.length; i++) {
    const success = await testConnection(connections[i], i);
    if (success) {
      console.log('\n✅ 找到可用连接！请使用此连接字符串。');
      process.exit(0);
    }
  }

  console.log('\n❌ 所有连接尝试均失败。请检查:');
  console.log('1. MongoDB服务是否运行');
  console.log('2. 用户名密码是否正确');
  console.log('3. 网络连接是否正常');
  console.log('4. 防火墙设置');
  process.exit(1);
}

main();
