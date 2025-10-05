import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LinkItem from '@/models/LinkItem';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      url,
      title,
      description,
      iconUrl,
      categoryId,
      tags,
      contactName,
      contactEmail,
    } = body;

    if (!url) {
      return NextResponse.json({ error: '请提供网址' }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: '请选择分类' }, { status: 400 });
    }

    const link = new LinkItem({
      title: title?.trim() || url,
      url,
      description,
      iconUrl,
      categoryId,
      order: 0,
      enabled: false,
      tags: Array.isArray(tags) ? tags : [],
      reviewStatus: 'pending',
      source: 'guest',
      submittedName: contactName,
      submittedEmail: contactEmail,
    });

    await link.save();

    return NextResponse.json({ message: '提交成功，请等待审核', linkId: link._id });
  } catch (error: any) {
    console.error('游客提交链接失败:', error);
    return NextResponse.json(
      { error: error?.message || '提交失败，请稍后重试' },
      { status: 500 }
    );
  }
}
