import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LinkItem from '@/models/LinkItem';
import { withAdminAuth } from '@/lib/middleware';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const link = await LinkItem.findById(id)
      .populate('categoryId', 'title')
      .lean();

    if (!link) {
      return NextResponse.json({ error: '网站不存在' }, { status: 404 });
    }

    return NextResponse.json({ link: JSON.parse(JSON.stringify(link)) });
  } catch (error) {
    console.error('获取链接详情失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(req, async () => {
    try {
      await connectDB();
      const { id } = await context.params;
      const body = await req.json();

      const link = await LinkItem.findById(id);
      if (!link) {
        return NextResponse.json({ error: '链接不存在' }, { status: 404 });
      }

      const {
        title,
        url,
        description,
        iconUrl,
        categoryId,
        order,
        enabled,
        tags,
        reviewStatus,
      } = body;

      if (title !== undefined) link.title = title;
      if (url !== undefined) link.url = url;
      if (description !== undefined) link.description = description;
      if (iconUrl !== undefined) link.iconUrl = iconUrl;
      if (categoryId !== undefined) link.categoryId = categoryId;
      if (order !== undefined) link.order = order;
      if (enabled !== undefined) link.enabled = enabled;
      if (tags !== undefined) link.tags = Array.isArray(tags) ? tags : [];
      if (reviewStatus !== undefined) link.reviewStatus = reviewStatus;

      await link.save();

      return NextResponse.json({ message: '链接更新成功', link });
    } catch (error) {
      console.error('更新链接失败:', error);
      return NextResponse.json({ error: '更新链接失败' }, { status: 500 });
    }
  });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(req, async () => {
    try {
      await connectDB();
      const { id } = await context.params;

      await LinkItem.findByIdAndDelete(id);

      return NextResponse.json({ message: '链接删除成功' });
    } catch (error) {
      console.error('删除链接失败:', error);
      return NextResponse.json({ error: '删除链接失败' }, { status: 500 });
    }
  });
}
