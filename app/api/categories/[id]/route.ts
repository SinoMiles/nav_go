import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { withAdminAuth } from '@/lib/middleware';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const category = await Category.findById(params.id);

    if (!category) {
      return NextResponse.json(
        { error: '分类不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error: any) {
    console.error('获取分类错误:', error);
    return NextResponse.json(
      { error: '获取分类失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdminAuth(req, async (req, user) => {
    try {
      await connectDB();

      const body = await req.json();
      const { title, slug, description, order, enabled, parentId } = body;

      const category = await Category.findById(params.id);

      if (!category) {
        return NextResponse.json(
          { error: '分类不存在' },
          { status: 404 }
        );
      }

      // 如果修改了slug，检查是否重复
      if (slug && slug !== category.slug) {
        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
          return NextResponse.json(
            { error: '该slug已被使用' },
            { status: 409 }
          );
        }
        category.slug = slug;
      }

      if (parentId !== undefined) {
        if (!parentId) {
          category.parentId = undefined;
        } else {
          if (parentId === category._id.toString()) {
            return NextResponse.json(
              { error: '不能选择自身为父级分类' },
              { status: 400 }
            );
          }

          const parent = await Category.findById(parentId);
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
          category.parentId = parent._id;
        }
      }

      if (title) category.title = title;
      if (description !== undefined) category.description = description;
      if (order !== undefined) category.order = order;
      if (enabled !== undefined) category.enabled = enabled;

      await category.save();

      return NextResponse.json({
        message: '分类更新成功',
        category,
      });
    } catch (error: any) {
      console.error('更新分类错误:', error);
      return NextResponse.json(
        { error: '更新分类失败' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdminAuth(req, async (req, user) => {
    try {
      await connectDB();

      const category = await Category.findByIdAndDelete(params.id);

      if (!category) {
        return NextResponse.json(
          { error: '分类不存在' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: '分类删除成功',
      });
    } catch (error: any) {
      console.error('删除分类错误:', error);
      return NextResponse.json(
        { error: '删除分类失败' },
        { status: 500 }
      );
    }
  });
}
