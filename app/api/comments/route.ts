import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { verifyToken } from '@/lib/auth';

// 获取评论
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('linkId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!linkId) {
      return NextResponse.json({ error: '缺少linkId参数' }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    const comments = await Comment.find({ linkId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Comment.countDocuments({ linkId });

    return NextResponse.json({
      comments: JSON.parse(JSON.stringify(comments)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 });
  }
}

// 发布评论
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '无效token' }, { status: 401 });
    }

    const { linkId, content } = await req.json();

    if (!linkId || !content || content.trim().length === 0) {
      return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 });
    }

    const comment = await Comment.create({
      userId: decoded.userId,
      linkId,
      content: content.trim(),
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'name email')
      .lean();

    return NextResponse.json({
      message: '评论成功',
      comment: JSON.parse(JSON.stringify(populatedComment)),
    });
  } catch (error) {
    console.error('评论失败:', error);
    return NextResponse.json({ error: '评论失败' }, { status: 500 });
  }
}

// 删除评论
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '无效token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('id');

    const comment = await Comment.findOne({ _id: commentId });

    if (!comment) {
      return NextResponse.json({ error: '评论不存在' }, { status: 404 });
    }

    // 只能删除自己的评论或管理员可删除任何评论
    if (comment.userId.toString() !== decoded.userId && decoded.role !== 'admin') {
      return NextResponse.json({ error: '无权删除' }, { status: 403 });
    }

    await Comment.deleteOne({ _id: commentId });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除评论失败:', error);
    return NextResponse.json({ error: '删除评论失败' }, { status: 500 });
  }
}
