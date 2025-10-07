import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/middleware";
import { getAvailableThemeNames } from "@/lib/theme-registry";

function buildPreviewUrl(theme: string, embed = false) {
  const search = new URLSearchParams({ theme });
  if (embed) search.set("embed", "1");
  return `/preview?${search.toString()}`;
}

export async function POST(req: NextRequest) {
  return withAdminAuth(req, async innerReq => {
    const body = await innerReq.json().catch(() => ({}));
    const theme = typeof body.theme === "string" ? body.theme.trim() : "";

    if (!theme) {
      return NextResponse.json({ error: "请提供主题名称" }, { status: 400 });
    }

    const available = getAvailableThemeNames();
    if (!available.includes(theme)) {
      return NextResponse.json({ error: "主题不存在或尚未安装" }, { status: 404 });
    }

    return NextResponse.json({
      message: "预览地址已生成",
      previewUrl: buildPreviewUrl(theme),
      embedUrl: buildPreviewUrl(theme, true),
    });
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const theme = searchParams.get("theme")?.trim();

  if (!theme) {
    return NextResponse.json({ error: "请提供主题名称" }, { status: 400 });
  }

  const available = getAvailableThemeNames();
  if (!available.includes(theme)) {
    return NextResponse.json({ error: "主题不存在或尚未安装" }, { status: 404 });
  }

  return NextResponse.json({
    previewUrl: buildPreviewUrl(theme),
    embedUrl: buildPreviewUrl(theme, true),
  });
}
