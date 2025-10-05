import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SearchEngineGroup from '@/models/SearchEngineGroup';
import { withAdminAuth } from '@/lib/middleware';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await context.params;
    const group = await SearchEngineGroup.findById(id).lean();
    if (!group) {
      return NextResponse.json({ error: '搜索分组不存在' }, { status: 404 });
    }
    return NextResponse.json({
      group: {
        ...group,
        _id: group._id.toString(),
        engines: (group.engines || []).map(engine => ({ ...engine })),
      },
    });
  } catch (error) {
    console.error('获取搜索分组失败:', error);
    return NextResponse.json({ error: '获取搜索分组失败' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return withAdminAuth(req, async () => {
    try {
      await connectDB();
      const { id } = await context.params;
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

      const updated = await SearchEngineGroup.findByIdAndUpdate(
        id,
        {
          name: name.trim(),
          order: Number.isFinite(order) ? Number(order) : 0,
          engines: normalizedEngines,
        },
        { new: true },
      ).lean();

      if (!updated) {
        return NextResponse.json({ error: '搜索分组不存在' }, { status: 404 });
      }

      return NextResponse.json({
        message: '搜索分组已更新',
        group: {
          ...updated,
          _id: updated._id.toString(),
        },
      });
    } catch (error) {
      console.error('更新搜索分组失败:', error);
      return NextResponse.json({ error: '更新搜索分组失败' }, { status: 500 });
    }
  });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return withAdminAuth(req, async () => {
    try {
      await connectDB();
      const { id } = await context.params;
      const deleted = await SearchEngineGroup.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json({ error: '搜索分组不存在' }, { status: 404 });
      }
      return NextResponse.json({ message: '搜索分组已删除' });
    } catch (error) {
      console.error('删除搜索分组失败:', error);
      return NextResponse.json({ error: '删除搜索分组失败' }, { status: 500 });
    }
  });
}
