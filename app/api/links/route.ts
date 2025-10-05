import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LinkItem from '@/models/LinkItem';
import { withAdminAuth } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const enabled = searchParams.get('enabled');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const reviewStatus = searchParams.get('reviewStatus');

    const query: any = {};
    if (categoryId) {
      query.categoryId = categoryId;
    }
    if (enabled !== null) {
      query.enabled = enabled === 'true';
    }
    if (reviewStatus) {
      query.reviewStatus = reviewStatus;
    }

    const skip = (page - 1) * limit;

    const [links, total] = await Promise.all([
      LinkItem.find(query)
        .populate('categoryId')
        .sort({ order: 1, createdAt: 1 })
        .skip(skip)
        .limit(limit),
      LinkItem.countDocuments(query),
    ]);

    return NextResponse.json({
      links,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('获取链接错误:', error);
    return NextResponse.json(
      { error: '获取链接失败' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return withAdminAuth(req, async (req, user) => {
    try {
      await connectDB();

      const body = await req.json();
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

      if (!title || !url || !categoryId) {
        return NextResponse.json(
          { error: '标题、URL和分类ID为必填项' },
          { status: 400 }
        );
      }

      const link = new LinkItem({
        title,
        url,
        description,
        iconUrl,
        categoryId,
        order: order || 0,
        enabled: enabled !== undefined ? enabled : true,
        tags: tags || [],
        reviewStatus: reviewStatus || 'approved',
        source: 'admin',
      });

      await link.save();

      return NextResponse.json(
        { message: '链接创建成功', link },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('创建链接错误:', error);
      return NextResponse.json(
        { error: '创建链接失败' },
        { status: 500 }
      );
    }
  });
}
