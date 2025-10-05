import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { normalizeSearchGroups } from "../utils/normalize";
import type { SearchGroup } from "../types";
import { INTERNAL_ENGINE_KEY, INTERNAL_GROUP_ID } from "../utils/constants";

type UseSearchEnginesResult = {
  effectiveGroups: SearchGroup[];
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
  selectedEngines: Record<string, string>;
  setSelectedEngines: Dispatch<SetStateAction<Record<string, string>>>;
};

export function useSearchEngines(): UseSearchEnginesResult {
  const [groups, setGroups] = useState<SearchGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(INTERNAL_GROUP_ID);
  const [selectedEngines, setSelectedEngines] = useState<Record<string, string>>({
    [INTERNAL_GROUP_ID]: INTERNAL_ENGINE_KEY,
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadGroups = async () => {
      try {
        const res = await fetch("/api/search-engines", { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        setGroups(normalizeSearchGroups(data?.groups ?? []));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("加载搜索引擎失败:", error);
        }
      }
    };

    void loadGroups();

    return () => controller.abort();
  }, []);

  const effectiveGroups = useMemo<SearchGroup[]>(() => {
    const builtIn: SearchGroup = {
      id: INTERNAL_GROUP_ID,
      name: "站内搜索",
      order: -Infinity,
      engines: [
        {
          key: INTERNAL_ENGINE_KEY,
          name: "站内搜索",
          urlTemplate: "",
          order: 0,
          isDefault: true,
        },
      ],
    };
    return [builtIn, ...groups];
  }, [groups]);

  useEffect(() => {
    setSelectedEngines(prev => {
      const next = { ...prev };
      effectiveGroups.forEach(group => {
        if (next[group.id]) return;
        const defaultEngine = group.engines.find(item => item.isDefault) ?? group.engines[0];
        if (defaultEngine) {
          next[group.id] = defaultEngine.key;
        }
      });
      return next;
    });
  }, [effectiveGroups]);

  useEffect(() => {
    if (!effectiveGroups.some(group => group.id === selectedGroupId)) {
      setSelectedGroupId(INTERNAL_GROUP_ID);
    }
  }, [effectiveGroups, selectedGroupId]);

  return {
    effectiveGroups,
    selectedGroupId,
    setSelectedGroupId,
    selectedEngines,
    setSelectedEngines,
  };
}
