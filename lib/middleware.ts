import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: { userId: string; role: string }) => Promise<NextResponse>
) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { error: '未授权，请先登录' },
      { status: 401 }
    );
  }

  const user = verifyToken(token);

  if (!user) {
    return NextResponse.json(
      { error: '令牌无效或已过期' },
      { status: 401 }
    );
  }

  return handler(req, user);
}

export async function withAdminAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: { userId: string; role: string }) => Promise<NextResponse>
) {
  return withAuth(req, async (req, user) => {
    if (user.role !== 'admin' && user.role !== 'editor') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }
    return handler(req, user);
  });
}
