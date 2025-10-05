#!/bin/bash

# NavGo 鍒濆鍖栬剼鏈?# 鐢ㄤ簬鍒濆鍖栨暟鎹簱鍜岄粯璁や富棰?
echo "馃殌 NavGo 鍒濆鍖栬剼鏈?
echo "======================="

# 绛夊緟MongoDB杩炴帴
echo "鈴?绛夊緟MongoDB杩炴帴..."
sleep 3

# 瀹夎榛樿涓婚
echo "馃摝 瀹夎榛樿涓婚..."

curl -X POST http://localhost:3000/api/themes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "default",
    "title": "榛樿涓婚",
    "description": "绠€娲佷紭闆呯殑榛樿瀵艰埅涓婚",
    "version": "1.0.0",
    "author": "NavGo"
  }'

echo ""

curl -X POST http://localhost:3000/api/themes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "modern",
    "title": "鐜颁唬涓婚",
    "description": "鐜颁唬绠€绾﹂鏍肩殑瀵艰埅涓婚",
    "version": "1.0.0",
    "author": "NavGo"
  }'

echo ""
echo "鉁?榛樿涓婚瀹夎瀹屾垚"

# 婵€娲婚粯璁や富棰?echo "馃帹 婵€娲婚粯璁や富棰?.."

curl -X POST http://localhost:3000/api/themes/activate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "themeName": "default"
  }'

echo ""
echo "鉁?鍒濆鍖栧畬鎴?"
echo ""
echo "馃摑 涓嬩竴姝?"
echo "1. 璁块棶 http://localhost:3000/admin/register 娉ㄥ唽绠＄悊鍛樿处鍙?
echo "2. 鐧诲綍鍚庡湪鍚庡彴娣诲姞鍒嗙被鍜岄摼鎺?
echo "3. 鍦ㄤ富棰樼鐞嗕腑鍒囨崲涓婚"
echo ""

