export type NormalizedCategory = {
  id: string;
  title: string;
  description: string;
  order: number;
  parentId: string | null;
};

export type NormalizedLink = {
  id: string;
  title: string;
  url: string;
  description: string;
  host: string;
  categoryId: string | null;
};

export type SearchEngine = {
  key: string;
  name: string;
  urlTemplate: string;
  order: number;
  isDefault: boolean;
};

export type SearchGroup = {
  id: string;
  name: string;
  order: number;
  engines: SearchEngine[];
};

export type CategoryData = {
  roots: NormalizedCategory[];
  childMap: ReadonlyMap<string, NormalizedCategory[]>;
  rootByChild: ReadonlyMap<string, string>;
  nodeMap: ReadonlyMap<string, NormalizedCategory>;
  allCategories: NormalizedCategory[];
};

export type LinkBuckets = {
  buckets: ReadonlyMap<string, ReadonlyMap<string, NormalizedLink[]>>;
  uncategorized: NormalizedLink[];
};
