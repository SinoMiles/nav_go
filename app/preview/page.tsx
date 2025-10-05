import connectDB from "@/lib/mongodb";
import PreviewToken from "@/models/PreviewToken";
import Category from "@/models/Category";
import LinkItem from "@/models/LinkItem";
import Settings from "@/models/Settings";
import Theme from "@/models/Theme";
import { getThemeConfig } from "@/lib/theme";
import { SAMPLE_CATEGORY_TREE } from "@/lib/sample-data";
import PreviewShell from "./PreviewShell";

const SIDEBAR_NAV_SCHEMA = {
  primaryColor: {
    type: "color",
    label: "\u4e3b\u8272\u8c03",
    default: "#2563eb",
  },
  contentColor: {
    type: "color",
    label: "\u5185\u5bb9\u8272",
    default: "#f8fafc",
  },
  backgroundColor: {
    type: "color",
    label: "\u80cc\u666f\u8272",
    default: "#e2e8f0",
  },
} as const satisfies Record<string, any>;

export const dynamic = "force-dynamic";

export default async function PreviewPage(props: {
  searchParams: Promise<{ theme?: string; token?: string }>;
}) {
  try {
    await connectDB();

    const searchParams = await props.searchParams;
    const { theme, token } = searchParams;

    if (!theme || !token) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-red-600">
              {"\u9884\u89c8\u5931\u8d25"}
            </h1>
            <p className="text-gray-600">
              {"\u7f3a\u5c11\u5fc5\u586b\u7684\u4e3b\u9898\u6216\u9884\u89c8\u4ee4\u724c"}
            </p>
          </div>
        </div>
      );
    }

    const previewToken = await PreviewToken.findOne({ token });

    if (!previewToken || previewToken.expiresAt < new Date()) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-red-600">
              {"\u9884\u89c8\u94fe\u63a5\u5df2\u8fc7\u671f"}
            </h1>
            <p className="text-gray-600">
              {"\u8bf7\u5728\u540e\u53f0\u91cd\u65b0\u751f\u6210\u9884\u89c8\u94fe\u63a5"}
            </p>
          </div>
        </div>
      );
    }

    if (previewToken.theme !== theme) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-red-600">
              {"\u4e3b\u9898\u4e0d\u5339\u914d"}
            </h1>
            <p className="text-gray-600">
              {"\u9884\u89c8\u4ee4\u724c\u4e0e\u5f53\u524d\u9009\u62e9\u7684\u4e3b\u9898\u4e0d\u4e00\u81f4"}
            </p>
          </div>
        </div>
      );
    }

    const themeConfig = await getThemeConfig(theme);
    const settings = await Settings.findOne({});
    const siteName = settings?.siteName || "NavCraft";

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

    const themeDoc = await Theme.findOne({ name: theme });
    const schemaFromDb =
      themeDoc?.configSchema && Object.keys(themeDoc.configSchema).length > 0
        ? (themeDoc.configSchema as Record<string, any>)
        : undefined;

    const configSchema =
      theme === "sidebar-nav"
        ? { ...SIDEBAR_NAV_SCHEMA, ...(schemaFromDb ?? {}) }
        : schemaFromDb ?? {};

    return (
      <PreviewShell
        themeName={theme}
        categories={categoriesData}
        links={linksData}
        siteName={siteName}
        initialConfig={themeConfig || {}}
        configSchema={configSchema}
      />
    );
  } catch (error) {
    console.error("preview page error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">
            {"\u9884\u89c8\u94fe\u63a5\u52a0\u8f7d\u5931\u8d25"}
          </h1>
          <p className="text-gray-600">
            {"\u8bf7\u7a0d\u540e\u518d\u8bd5"}
          </p>
        </div>
      </div>
    );
  }
}
