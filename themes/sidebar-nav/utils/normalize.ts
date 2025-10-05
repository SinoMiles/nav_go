import type { NormalizedCategory, NormalizedLink, SearchEngine, SearchGroup } from "../types";
import { ROOT_BUCKET } from "./constants";

const FALLBACK_CATEGORY = "未命名分类";
const FALLBACK_LINK = "未命名链接";
const FALLBACK_GROUP = "未命名分组";

export const toId = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && typeof (value as { toString?: () => string }).toString === "function") {
    return (value as { toString(): string }).toString();
  }
  return String(value ?? "");
};

export const toText = (value: unknown, fallback = "") => {
  const text = typeof value === "string" ? value : toId(value);
  return text || fallback;
};

export const resolveParentId = (category: any): string | null => {
  const parent = category?.parentId ?? null;
  if (!parent) return null;
  if (typeof parent === "string") return parent;
  if (typeof parent === "object") {
    if (parent._id) return toId(parent._id);
    if (typeof parent.toString === "function") return toId(parent.toString());
  }
  return null;
};

export const safeHost = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export const normalizeCategories = (raw: any[]) => {
  const nodes: NormalizedCategory[] = (raw || []).map(item => ({
    id: toId(item?._id),
    title: toText(item?.title, FALLBACK_CATEGORY),
    description: toText(item?.description),
    order: typeof item?.order === "number" ? item.order : 0,
    parentId: resolveParentId(item),
  }));

  const nodeMap = new Map<string, NormalizedCategory>();
  nodes.forEach(node => {
    if (node.id) nodeMap.set(node.id, node);
  });

  const roots: NormalizedCategory[] = [];
  const childMap = new Map<string, NormalizedCategory[]>();
  const rootByChild = new Map<string, string>();

  nodes.forEach(node => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      const list = childMap.get(node.parentId) ?? [];
      list.push(node);
      childMap.set(node.parentId, list);
      rootByChild.set(node.id, node.parentId);
    } else {
      roots.push(node);
    }
  });

  const sortFn = (a: NormalizedCategory, b: NormalizedCategory) =>
    a.order - b.order || a.title.localeCompare(b.title, "zh-CN");

  roots.sort(sortFn);
  childMap.forEach(children => children.sort(sortFn));

  return { roots, childMap, rootByChild, nodeMap, allCategories: nodes };
};

export const normalizeLinks = (raw: any[]): NormalizedLink[] =>
  (raw || []).map(item => {
    const url = toText(item?.url, "#");
    return {
      id: toId(item?._id) || url,
      title: toText(item?.title, FALLBACK_LINK),
      url,
      description: toText(item?.description),
      host: safeHost(url),
      categoryId: item?.categoryId ? toId(item.categoryId) : null,
    };
  });

export const buildLinkBuckets = (
  roots: NormalizedCategory[],
  rootByChild: ReadonlyMap<string, string>,
  links: NormalizedLink[],
) => {
  const buckets = new Map<string, Map<string, NormalizedLink[]>>();
  const rootIds = new Set(roots.map(root => root.id));
  roots.forEach(root => buckets.set(root.id, new Map()));

  const uncategorized: NormalizedLink[] = [];

  links.forEach(link => {
    const categoryId = link.categoryId;
    let rootId: string | null = null;
    let bucketKey = ROOT_BUCKET;

    if (categoryId && rootByChild.has(categoryId)) {
      rootId = rootByChild.get(categoryId)!;
      bucketKey = `child:${categoryId}`;
    } else if (categoryId && rootIds.has(categoryId)) {
      rootId = categoryId;
    }

    if (rootId && buckets.has(rootId)) {
      const rootBucket = buckets.get(rootId)!;
      const list = rootBucket.get(bucketKey) ?? [];
      list.push(link);
      rootBucket.set(bucketKey, list);
    } else {
      uncategorized.push(link);
    }
  });

  return { buckets, uncategorized };
};

export const normalizeSearchGroups = (raw: any[]): SearchGroup[] =>
  (raw || [])
    .map(group => {
      const engines = Array.isArray(group?.engines)
        ? group.engines
            .map((engine: any, index: number): SearchEngine | null => {
              const name = toText(engine?.name);
              const urlTemplate = toText(engine?.urlTemplate);
              if (!name || !urlTemplate) return null;
              return {
                key: `${name}::${urlTemplate}`,
                name,
                urlTemplate,
                order: Number.isFinite(engine?.order) ? Number(engine.order) : index,
                isDefault: Boolean(engine?.isDefault),
              };
            })
            .filter(Boolean) as SearchEngine[]
        : [];

      engines.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "zh-CN"));

      return {
        id: toId(group?._id) || toText(group?.name),
        name: toText(group?.name, FALLBACK_GROUP),
        order: Number.isFinite(group?.order) ? Number(group.order) : 0,
        engines,
      };
    })
    .filter(group => group.engines.length > 0)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "zh-CN"));

export const buildSearchUrl = (template: string, keyword: string) => {
  const encoded = encodeURIComponent(keyword);
  return template.includes("{query}") ? template.replaceAll("{query}", encoded) : `${template}${encoded}`;
};
