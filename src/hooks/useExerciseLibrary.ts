import { useCallback, useEffect, useState } from "react";
import {
  fetchCatalogFilters,
  searchCatalogVariants,
  type CatalogVariantItem,
} from "../services/internalExerciseCatalogService";

export function useExerciseLibrary() {
  const [items, setItems] = useState<CatalogVariantItem[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipments, setEquipments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (params?: { search?: string; muscleGroup?: string | null; equipment?: string | null; limit?: number }) => {
    setLoading(true);
    setError(null);
    const [searchResult, filterResult] = await Promise.all([
      searchCatalogVariants({
        query: params?.search,
        muscleGroup: params?.muscleGroup ?? null,
        equipment: params?.equipment ?? null,
        limit: params?.limit ?? 120,
      }),
      fetchCatalogFilters(),
    ]);
    if (searchResult.error) {
      setError(searchResult.error);
      setItems([]);
    } else {
      setItems(searchResult.items);
    }
    if (!filterResult.error) {
      setMuscleGroups(filterResult.muscleGroups);
      setEquipments(filterResult.equipments);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load({});
  }, [load]);

  return { items, muscleGroups, equipments, loading, error, load };
}
