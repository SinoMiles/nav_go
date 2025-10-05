import { useMemo } from "react";

import { buildLinkBuckets, normalizeCategories, normalizeLinks } from "../utils/normalize";
import type { NormalizedCategory, NormalizedLink } from "../types";

type UseCategoryDataResult = {
  roots: NormalizedCategory[];
  childMap: ReadonlyMap<string, NormalizedCategory[]>;
  rootByChild: ReadonlyMap<string, string>;
  nodeMap: ReadonlyMap<string, NormalizedCategory>;
  allCategories: NormalizedCategory[];
  normalizedLinks: NormalizedLink[];
  buckets: ReadonlyMap<string, ReadonlyMap<string, NormalizedLink[]>>;
  uncategorized: NormalizedLink[];
};

export function useCategoryData(categories: any[], links: any[]): UseCategoryDataResult {
  return useMemo(() => {
    const { roots, childMap, rootByChild, nodeMap, allCategories } = normalizeCategories(categories);
    const normalizedLinks = normalizeLinks(links);
    const { buckets, uncategorized } = buildLinkBuckets(roots, rootByChild, normalizedLinks);

    return {
      roots,
      childMap,
      rootByChild,
      nodeMap,
      allCategories,
      normalizedLinks,
      buckets,
      uncategorized,
    };
  }, [categories, links]);
}
