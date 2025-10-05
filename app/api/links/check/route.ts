import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LinkItem from '@/models/LinkItem';
import { withAdminAuth } from '@/lib/middleware';

interface CheckResult {
  id: string;
  status: number | string;
  ok: boolean;
}

async function probeUrl(url: string, timeout = 8000): Promise<CheckResult['status']> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (response.ok) {
      return response.status;
    }

    // Fallback to GET if HEAD not allowed
    const getResponse = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });
    return getResponse.status;
  } catch (error: any) {
    clearTimeout(timer);
    if (error?.name === 'AbortError') {
      return 'timeout';
    }
    return 'error';
  }
}

export async function POST(req: NextRequest) {
  return withAdminAuth(req, async (request) => {
    try {
      await connectDB();

      const body = await request.json().catch(() => ({}));
      const linkIds: string[] | undefined = body?.linkIds;

      const query = linkIds && Array.isArray(linkIds) && linkIds.length > 0
        ? { _id: { $in: linkIds } }
        : {};

      const links = await LinkItem.find(query).lean();

      const results: CheckResult[] = await Promise.all(
        links.map(async (link: any) => {
          const status = await probeUrl(link.url);
          return {
            id: link._id.toString(),
            status,
            ok: typeof status === 'number' ? status >= 200 && status < 400 : false,
          };
        })
      );

      return NextResponse.json({ results });
    } catch (error: any) {
      console.error('批量检查链接失败:', error);
      return NextResponse.json(
        { error: '批量检查链接失败' },
        { status: 500 }
      );
    }
  });
}
