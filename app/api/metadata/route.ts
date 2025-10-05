import { NextRequest, NextResponse } from 'next/server';

const METADATA_ENDPOINT = 'https://uapis.cn/api/v1/webparse/metadata';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 });
  }

  try {
    const apiUrl = `${METADATA_ENDPOINT}?url=${encodeURIComponent(targetUrl)}`;
    const response = await fetch(apiUrl, { cache: 'no-store' });

    if (!response.ok) {
      return NextResponse.json(
        { error: '元数据接口请求失败', status: response.status },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json({ metadata: data });
  } catch (error: any) {
    console.error('获取站点元数据失败:', error);
    return NextResponse.json(
      { error: error?.message || '获取站点元数据失败' },
      { status: 500 }
    );
  }
}
