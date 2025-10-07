import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import LinkItem from "@/models/LinkItem";
import Settings from "@/models/Settings";
import { getThemeConfig, syncThemesWithFilesystem } from "@/lib/theme";
import { getThemeManifest, getAvailableThemeNames } from "@/lib/theme-registry";
import { SAMPLE_CATEGORY_TREE } from "@/lib/sample-data";
import PreviewShell from "./PreviewShell";

export const dynamic = "force-dynamic";

interface PreviewPageProps {
  searchParams?: {
    theme?: string;
    embed?: string;
  };
}

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  try {
    await connectDB();
    await syncThemesWithFilesystem();

    const theme = searchParams?.theme?.trim();
    const embedFlag = searchParams?.embed?.toLowerCase?.() ?? "";
    const isEmbed = embedFlag === "1" || embedFlag === "true";

    if (!theme) {
      return (
        <ErrorState
          title="缺少主题参数"
          description="请在 URL 中提供 theme 参数"
        />
      );
    }

    const availableThemes = getAvailableThemeNames();
    if (!availableThemes.includes(theme)) {
      return (
        <ErrorState
          title="主题不存在"
          description="请确认主题文件夹已放置于 /themes 中"
        />
      );
    }

    const manifest = getThemeManifest(theme);
    const themeConfig = await getThemeConfig(theme);
    const settings = await Settings.findOne({});
    const siteName = settings?.siteName || "NavGo";

    const categories = await Category.find({ enabled: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const links = await LinkItem.find({
      enabled: true,
      $or: [{ reviewStatus: { $exists: false } }, { reviewStatus: "approved" }],
    })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const categoriesData: any[] = JSON.parse(JSON.stringify(categories));
    const linksData: any[] = JSON.parse(JSON.stringify(links));

    if (categoriesData.length === 0) {
      const idMap = new Map<string, string>();

      SAMPLE_CATEGORY_TREE.forEach(root => {
        categoriesData.push({
          _id: root.id,
          title: root.title,
          slug: root.slug,
          description: root.description,
          order: root.order ?? 0,
          enabled: true,
        });
        idMap.set(root.id, root.id);

        root.children?.forEach(child => {
          categoriesData.push({
            _id: child.id,
            title: child.title,
            slug: child.slug,
            description: child.description,
            order: child.order ?? 0,
            enabled: true,
            parentId: root.id,
          });
          idMap.set(child.id, child.id);
        });

        root.links?.forEach(link => {
          const targetCategoryId = idMap.get(link.categoryId ?? root.id) ?? root.id;
          linksData.push({
            _id: link.id,
            title: link.title,
            url: link.url,
            description: link.description,
            iconUrl: link.iconUrl,
            categoryId: targetCategoryId,
            tags: link.tags,
            order: link.order ?? 0,
            enabled: true,
            clicks: 0,
            reviewStatus: "approved",
            source: "admin",
          });
        });
      });
    }

    const schemaFromManifest =
      manifest?.configSchema && Object.keys(manifest.configSchema).length > 0
        ? (manifest.configSchema as Record<string, any>)
        : undefined;

    const configSchema = schemaFromManifest ?? {};

    return (
      <PreviewShell
        themeName={theme}
        categories={categoriesData}
        links={linksData}
        siteName={siteName}
        initialConfig={themeConfig || {}}
        configSchema={configSchema}
        embed={isEmbed}
      />
    );
  } catch (error) {
    console.error("preview page error:", error);
    return (
      <ErrorState
        title="预览加载失败"
        description="请稍后再试"
      />
    );
  }
}

function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-red-600">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
