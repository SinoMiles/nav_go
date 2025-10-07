import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LinkItem from "@/models/LinkItem";
import Settings from "@/models/Settings";

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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

    const settings = await Settings.findOne({});
    const configuredDomain = settings?.friendLinkDomain?.trim() || "";
    const expectedHost = normalizeDomain(configuredDomain);

    let autoApproved = false;
    if (expectedHost) {
      const html = await fetchHtml(normalizedUrl.toString());
      if (html) {
        const escaped = escapeRegExp(expectedHost);
        const pattern = new RegExp(`https?:\\/\\/[^"'\\s>]*${escaped}|${escaped}`, "i");
        autoApproved = pattern.test(html);
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
      message: autoApproved
        ? "Link verified and published automatically."
        : "Submission received and awaiting review.",
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

