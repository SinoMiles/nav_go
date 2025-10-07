
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LinkItem from "@/models/LinkItem";

function normalizeDomain(raw?: string | null): string | null {
  if (!raw) return null;
  try {
    const withProtocol = raw.includes("//") ? raw : `https://${raw}`;
    const { hostname } = new URL(withProtocol);
    return hostname.toLowerCase();
  } catch {
    return null;
  }
}

async function fetchHtml(targetUrl: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "NavSiteBot/1.0 (+https://navsite.example)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text")) return null;
    const html = await res.text();
    return html.slice(0, 500_000);
  } catch (error) {
    console.error("Failed to fetch submitted site for reciprocity check:", error);
    return null;
  }
}

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
      return NextResponse.json({ error: "Please provide the website URL." }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: "Please choose a category." }, { status: 400 });
    }

    let normalizedUrl: URL;
    try {
      normalizedUrl = new URL(url);
    } catch {
      try {
        normalizedUrl = new URL(`https://${url}`);
      } catch {
        return NextResponse.json({ error: "Invalid website URL." }, { status: 400 });
      }
    }

    const expectedHosts: string[] = [];
    const envDomain = process.env.NEXT_PUBLIC_SITE_DOMAIN;
    if (envDomain) {
      envDomain.split(",").map(item => item.trim()).forEach(item => {
        const host = normalizeDomain(item);
        if (host) expectedHosts.push(host);
      });
    }
    const authUrl = process.env.NEXTAUTH_URL;
    const hostFromAuth = normalizeDomain(authUrl);
    if (hostFromAuth) expectedHosts.push(hostFromAuth);

    const uniqueHosts = Array.from(new Set(expectedHosts)).filter(Boolean);

    let autoApproved = false;
    if (uniqueHosts.length > 0) {
      const html = await fetchHtml(normalizedUrl.toString());
      if (html) {
        const lowerHtml = html.toLowerCase();
        autoApproved = uniqueHosts.some(host =>
          lowerHtml.includes(host) ||
          lowerHtml.includes(`https://${host}`) ||
          lowerHtml.includes(`http://${host}`),
        );
      }
    }

    const link = new LinkItem({
      title: title?.trim() || normalizedUrl.hostname,
      url: normalizedUrl.toString(),
      description,
      iconUrl,
      categoryId,
      order: 0,
      enabled: autoApproved,
      tags: Array.isArray(tags) ? tags : [],
      reviewStatus: autoApproved ? "approved" : "pending",
      source: "guest",
      submittedName: contactName,
      submittedEmail: contactEmail,
    });

    await link.save();

    return NextResponse.json({
      message: autoApproved ? "Link verified and published automatically." : "Submission received and awaiting review.",
      autoApproved,
      linkId: link._id,
    });
  } catch (error: any) {
    console.error("Guest link submission failed:", error);
    return NextResponse.json(
      { error: error?.message || "Submission failed, please try again later." },
      { status: 500 },
    );
  }
}
