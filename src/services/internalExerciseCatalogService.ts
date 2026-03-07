import { supabase } from "../lib/supabaseClient";

export type CatalogVariantItem = {
  variantId: string;
  exerciseId: string;
  exerciseNameFr: string;
  variantNameFr: string;
  muscleGroupFr: string;
  equipmentFr: string;
  descriptionFr: string | null;
  imageUrl: string | null;
  score: number;
};

export async function searchCatalogVariants(params?: {
  query?: string;
  muscleGroup?: string | null;
  equipment?: string | null;
  limit?: number;
}) {
  const { data, error } = await supabase.rpc("search_exercise_variants", {
    p_query: params?.query?.trim() || null,
    p_muscle_group: params?.muscleGroup?.trim() || null,
    p_equipment: params?.equipment?.trim() || null,
    p_limit: params?.limit ?? 80,
  });

  if (error) {
    return { error: error.message, items: [] as CatalogVariantItem[] };
  }

  const items = ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    variantId: String(row.variant_id),
    exerciseId: String(row.exercise_id),
    exerciseNameFr: String(row.exercise_name_fr),
    variantNameFr: String(row.variant_name_fr),
    muscleGroupFr: String(row.muscle_group_fr),
    equipmentFr: String(row.equipment_fr),
    descriptionFr: (row.description_fr as string | null) ?? null,
    imageUrl: (row.image_url as string | null) ?? null,
    score: Number(row.score ?? 0),
  }));

  return { error: null, items };
}

export async function fetchCatalogFilters() {
  const [groupsRes, equipmentsRes] = await Promise.all([
    supabase
      .from("exercise_catalog")
      .select("muscle_group_fr")
      .eq("is_active", true)
      .order("muscle_group_fr", { ascending: true }),
    supabase
      .from("exercise_variant")
      .select("equipment_fr")
      .eq("is_active", true)
      .order("equipment_fr", { ascending: true }),
  ]);

  if (groupsRes.error) {
    return { error: groupsRes.error.message, muscleGroups: [] as string[], equipments: [] as string[] };
  }
  if (equipmentsRes.error) {
    return { error: equipmentsRes.error.message, muscleGroups: [] as string[], equipments: [] as string[] };
  }

  const muscleGroups = Array.from(
    new Set((groupsRes.data ?? []).map((row) => String(row.muscle_group_fr)).filter(Boolean)),
  );
  const equipments = Array.from(
    new Set((equipmentsRes.data ?? []).map((row) => String(row.equipment_fr)).filter(Boolean)),
  );

  return { error: null, muscleGroups, equipments };
}
