import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { withAdminAuth } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const enabled = searchParams.get('enabled');

    const query: any = {};
    if (enabled !== null) {
      query.enabled = enabled === 'true';
    }
    const parentId = searchParams.get('parentId');
    if (parentId) {
      query.parentId = parentId === 'null' ? null : parentId;
    }

    const categories = await Category.find(query)
      .populate('parentId', 'title')
      .sort({ order: 1, createdAt: 1 });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('获取分类错误:', error);
    return NextResponse.json(
      { error: '获取分类失败' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return withAdminAuth(req, async (req, user) => {
    try {
      await connectDB();

      const body = await req.json();
      const { title, slug, description, order, enabled, parentId } = body;

      if (!title || !slug) {
        return NextResponse.json(
          { error: '标题和slug为必填项' },
          { status: 400 }
        );
      }

      // 检查slug是否已存在
      const existingCategory = await Category.findOne({ slug });
      if (existingCategory) {
        return NextResponse.json(
          { error: '该slug已被使用' },
          { status: 409 }
        );
      }

      let parent = null;
      if (parentId) {
        parent = await Category.findById(parentId);
        if (!parent) {
          return NextResponse.json(
            { error: '父级分类不存在' },
            { status: 400 }
          );
        }
        if (parent.parentId) {
          return NextResponse.json(
            { error: '只支持两级分类，无法继续嵌套' },
            { status: 400 }
          );
        }
      }

      const category = new Category({
        title,
        slug,
        description,
        order: order || 0,
        enabled: enabled !== undefined ? enabled : true,
        parentId: parent ? parent._id : undefined,
      });

      await category.save();

      return NextResponse.json(
        { message: '分类创建成功', category },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('创建分类错误:', error);
      return NextResponse.json(
        { error: '创建分类失败' },
        { status: 500 }
      );
    }
  });
}
