import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SearchEngineGroup from '@/models/SearchEngineGroup';
import { withAdminAuth } from '@/lib/middleware';

export async function GET() {
  try {
    await connectDB();
    const groups = await SearchEngineGroup.find()
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({
      groups: groups.map(group => ({
        ...group,
        _id: group._id.toString(),
        engines: (group.engines || []).map(engine => ({ ...engine })),
      })),
    });
  } catch (error) {
    console.error('加载搜索引擎配置失败:', error);
    return NextResponse.json({ error: '获取搜索引擎配置失败' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return withAdminAuth(req, async () => {
    try {
      await connectDB();
      const body = await req.json();
      const { name, order = 0, engines = [] } = body ?? {};

      if (!name || typeof name !== 'string') {
        return NextResponse.json({ error: '搜索分组名称不能为空' }, { status: 400 });
      }

      const sanitizedEngines = Array.isArray(engines)
        ? engines
            .map((engine: any, index: number) => ({
              name: String(engine?.name || '').trim(),
              urlTemplate: String(engine?.urlTemplate || '').trim(),
              order: Number.isFinite(engine?.order) ? Number(engine.order) : index,
              isDefault: Boolean(engine?.isDefault),
            }))
            .filter(engine => engine.name && engine.urlTemplate)
        : [];

      let defaultMarked = false;
      const normalizedEngines = sanitizedEngines.map(engine => {
        if (engine.isDefault && !defaultMarked) {
          defaultMarked = true;
          return engine;
        }
        return { ...engine, isDefault: false };
      });

      const created = await SearchEngineGroup.create({
        name: name.trim(),
        order: Number.isFinite(order) ? Number(order) : 0,
        engines: normalizedEngines,
      });

      return NextResponse.json({
        message: '搜索分组已创建',
        group: {
          ...created.toObject(),
          _id: created._id.toString(),
        },
      });
    } catch (error) {
      console.error('创建搜索分组失败:', error);
      return NextResponse.json({ error: '创建搜索分组失败' }, { status: 500 });
    }
  });
}
