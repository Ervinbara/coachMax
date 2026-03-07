import { useEffect, useMemo, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { AppButton, AppCard, Screen } from "../../src/components";
import { colors } from "../../src/design/tokens";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useLocaleStore } from "../../src/features/settings/useLocaleStore";
import { useCoachflowClients } from "../../src/hooks/useCoachflowClients";
import { useExerciseLibrary } from "../../src/hooks/useExerciseLibrary";
import { t } from "../../src/lib/i18n";
import { AppTopBar } from "../../src/layout/AppTopBar";
import { RoleNav } from "../../src/layout/RoleNav";
import { createProgramForClient, type ProgramExerciseInput } from "../../src/services/coachflowService";

const EXERCISE_TEMPLATES: Array<{
  id: string;
  label: string;
  values: Partial<ProgramExerciseInput>;
}> = [
  { id: "force", label: "Template Force", values: { sets: "5", reps: "3-5", tempo: "2-1-1-0", rpe: "8", restSeconds: "180", progressionRule: "+2.5kg si toutes les reps passent", rmRef: "85-90% 1RM" } },
  { id: "hypertrophie", label: "Template Hypertrophie", values: { sets: "4", reps: "8-12", tempo: "3-1-1-0", rpe: "8", restSeconds: "90", progressionRule: "+1 rep/serie puis +2kg", rmRef: "65-75% 1RM" } },
  { id: "endurance", label: "Template Endurance", values: { sets: "3", reps: "15-20", tempo: "2-0-2-0", rpe: "7", restSeconds: "45", progressionRule: "Augmenter reps avant charge", rmRef: "50-60% 1RM" } },
  { id: "technique", label: "Template Technique", values: { sets: "5", reps: "2-4", tempo: "controle", rpe: "6", restSeconds: "120", progressionRule: "Priorite execution", rmRef: "50-70% 1RM" } },
];

const NOTICES: Array<{ key: string; title: string; text: string }> = [
  { key: "rpe", title: "RPE", text: "Echelle de 1 a 10 de difficulte percue. 8 = environ 2 repetitions en reserve." },
  { key: "rir", title: "RIR", text: "Repetitions In Reserve: nombre de reps qu'il restait avant echec." },
  { key: "rm", title: "%1RM", text: "Pourcentage de la charge maximale sur 1 repetition (1RM)." },
  { key: "tempo", title: "Tempo", text: "Format excentrique-pause-concentrique-pause. Ex: 3-1-1-0." },
  { key: "charge", title: "Charge", text: "Methode de prescription de l'intensite: kg fixes, %1RM, poids du corps, ou cible RPE." },
];

const LOAD_TYPE_OPTIONS: Array<{ id: string; label: string }> = [
  { id: "kg", label: "Kg fixes" },
  { id: "%1RM", label: "%1RM" },
  { id: "BW", label: "Poids du corps" },
  { id: "RPE", label: "Cible RPE" },
];

export default function ProgramBuilderScreen() {
  const initialized = useAuthStore((state) => state.initialized);
  const role = useAuthStore((state) => state.role);
  const locale = useLocaleStore((state) => state.locale);
  const [programTitle, setProgramTitle] = useState("Programme Force Semaine 1");
  const [sessionName, setSessionName] = useState("Lower Body Strength");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");
  const [selectedExercises, setSelectedExercises] = useState<ProgramExerciseInput[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [noticeKey, setNoticeKey] = useState<string | null>(null);
  const { items, muscleGroups, equipments, loading, error, load } = useExerciseLibrary();
  const { clients, loading: clientsLoading, error: clientsError } = useCoachflowClients();

  useEffect(() => {
    if (!selectedClientId && clients.length) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  const displayedExercises = useMemo(() => items.slice(0, 80), [items]);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) ?? null,
    [clients, selectedClientId],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      load({
        search,
        muscleGroup: selectedMuscleGroup || null,
        equipment: selectedEquipment || null,
        limit: 120,
      });
    }, 220);

    return () => clearTimeout(timer);
  }, [search, selectedMuscleGroup, selectedEquipment, load]);

  if (!initialized) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;
  }

  if (role !== "coach") {
    return <Redirect href="/(auth)/login" />;
  }

  const toggleExercise = (exercise: { id: string; name: string }) => {
    setSelectedExercises((current) =>
      current.some((item) => item.id === exercise.id)
        ? current.filter((item) => item.id !== exercise.id)
        : [...current, { ...exercise }]
    );
  };

  const applyTemplateToExercise = (exerciseId: string, templateId: string) => {
    const template = EXERCISE_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;
    setSelectedExercises((current) =>
      current.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, ...template.values }
          : exercise,
      ),
    );
  };

  const applyTemplateToAll = (templateId: string) => {
    const template = EXERCISE_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;
    setSelectedExercises((current) => current.map((exercise) => ({ ...exercise, ...template.values })));
  };

  const updateExerciseOption = (exerciseId: string, key: keyof ProgramExerciseInput, value: string | boolean) => {
    setSelectedExercises((current) =>
      current.map((exercise) => (exercise.id === exerciseId ? { ...exercise, [key]: value } : exercise)),
    );
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleSelectGroup = (group: string) => {
    const next = selectedMuscleGroup === group ? "" : group;
    setSelectedMuscleGroup(next);
  };

  const handleSelectEquipment = (equipment: string) => {
    const next = selectedEquipment === equipment ? "" : equipment;
    setSelectedEquipment(next);
  };

  const handleSaveProgram = async () => {
    setFeedback(null);
    if (!selectedClientId) {
      setFeedback("Selectionnez un client.");
      return;
    }

    const result = await createProgramForClient({
      clientId: selectedClientId,
      title: programTitle,
      sessionFocus: sessionName,
      exercises: selectedExercises,
      durationWeeks: 8,
    });

    if (result.error) {
      setFeedback(result.error);
      return;
    }

    setFeedback(`Programme enregistre pour ${selectedClient?.name ?? "le client"} (id ${result.programId}).`);
    setSelectedExercises([]);
  };

  return (
    <Screen>
      <AppTopBar title={t(locale, "builder.program.title")} subtitle={t(locale, "builder.program.subtitle")} showBack backHref="/(coach)/dashboard" />
      <RoleNav role="coach" />
      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#E8E9F5", fontWeight: "700", fontSize: 18 }}>
            {t(locale, "builder.program.step1")}
          </Text>
          <TextInput
            value={programTitle}
            onChangeText={setProgramTitle}
            style={{
              backgroundColor: "#07091a",
              borderWidth: 1,
              borderColor: "#1D2040",
              color: "#E8E9F5",
              borderRadius: 10,
              padding: 12,
              fontSize: 15,
            }}
            placeholder="Titre du programme"
            placeholderTextColor="#7B80A4"
          />
          <TextInput
            value={sessionName}
            onChangeText={setSessionName}
            style={{
              backgroundColor: "#07091a",
              borderWidth: 1,
              borderColor: "#1D2040",
              color: "#E8E9F5",
              borderRadius: 10,
              padding: 12,
              fontSize: 15,
            }}
            placeholder="Focus de la seance"
            placeholderTextColor="#7B80A4"
          />
          <Text style={{ color: "#E8E9F5", opacity: 0.65, fontSize: 13 }}>
            {t(locale, "builder.program.step2")}
          </Text>

          <Text style={{ color: "#E8E9F5", opacity: 0.72, fontSize: 13 }}>Client cible</Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {clientsLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              clients.map((client) => (
                <AppButton
                  key={client.id}
                  label={client.name}
                  variant={selectedClientId === client.id ? "primary" : "ghost"}
                  onPress={() => setSelectedClientId(client.id)}
                />
              ))
            )}
          </View>
          {clientsError ? <Text style={{ color: "#ff8b8b", fontSize: 12 }}>{clientsError}</Text> : null}

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <AppButton label="Rafraichir" onPress={() => load({ search, muscleGroup: selectedMuscleGroup || null, equipment: selectedEquipment || null, limit: 120 })} />
            <AppButton label={`Selection (${selectedExercises.length})`} variant="ghost" />
          </View>

          {selectedExercises.length ? (
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {EXERCISE_TEMPLATES.map((template) => (
                <AppButton
                  key={template.id}
                  label={template.label}
                  variant="ghost"
                  onPress={() => applyTemplateToAll(template.id)}
                />
              ))}
            </View>
          ) : null}

          <TextInput
            value={search}
            onChangeText={handleSearch}
            placeholder="Rechercher un exercice"
            placeholderTextColor="#7B80A4"
            style={{
              backgroundColor: "#07091a",
              borderWidth: 1,
              borderColor: "#1D2040",
              color: "#E8E9F5",
              borderRadius: 10,
              padding: 12,
              fontSize: 15,
            }}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8, paddingVertical: 2 }}>
              {muscleGroups.map((group) => (
                <Pressable
                  key={group}
                  onPress={() => handleSelectGroup(group)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: selectedMuscleGroup === group ? "#8B8FFF" : "#1D2040",
                    backgroundColor: selectedMuscleGroup === group ? "#181D44" : "#07091a",
                  }}
                >
                  <Text style={{ color: "#E8E9F5", fontSize: 12, fontWeight: "600" }}>{group}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8, paddingVertical: 2 }}>
              {equipments.map((equipment) => (
                <Pressable
                  key={equipment}
                  onPress={() => handleSelectEquipment(equipment)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: selectedEquipment === equipment ? "#8B8FFF" : "#1D2040",
                    backgroundColor: selectedEquipment === equipment ? "#181D44" : "#07091a",
                  }}
                >
                  <Text style={{ color: "#E8E9F5", fontSize: 12, fontWeight: "600" }}>{equipment}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {error ? <Text style={{ color: "#ff8b8b", fontSize: 12 }}>{error}</Text> : null}
          {feedback ? <Text style={{ color: "#8bc1ff", fontSize: 12 }}>{feedback}</Text> : null}

          <View style={{ maxHeight: 320 }}>
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <ScrollView>
                <View style={{ gap: 8 }}>
                  {displayedExercises.map((exercise) => {
                    const selected = selectedExercises.some((item) => item.id === exercise.variantId);
                    return (
                      <Pressable
                        key={exercise.variantId}
                        onPress={() => toggleExercise({ id: exercise.variantId, name: exercise.variantNameFr })}
                        style={{
                          borderWidth: 1,
                          borderColor: selected ? "#6266F1" : "#1D2040",
                          backgroundColor: selected ? "#161B40" : "#07091a",
                          borderRadius: 12,
                          padding: 10,
                          flexDirection: "row",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <Image
                          source={{
                            uri:
                              exercise.imageUrl ??
                              "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
                          }}
                          style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: "#11142A" }}
                        />
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={{ color: "#E8E9F5", fontSize: 14, fontWeight: "700" }}>{exercise.variantNameFr}</Text>
                          <Text style={{ color: "#7B80A4", fontSize: 12 }}>
                            {exercise.muscleGroupFr} - {exercise.equipmentFr}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </View>

          {selectedExercises.length ? (
            <View style={{ gap: 10 }}>
              <Text style={{ color: "#E8E9F5", fontWeight: "700", fontSize: 15 }}>
                Parametres optionnels par exercice
              </Text>
              <Text style={{ color: "#A8B4DF", fontSize: 12 }}>
                Tous les champs ci-dessous sont facultatifs. Tu peux laisser vide et enregistrer quand meme.
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {NOTICES.map((notice) => (
                  <Pressable
                    key={notice.key}
                    onPress={() => setNoticeKey((current) => (current === notice.key ? null : notice.key))}
                    style={{
                      borderWidth: 1,
                      borderColor: "#2B335A",
                      backgroundColor: "#0A0D1F",
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}
                  >
                    <Text style={{ color: "#9EB5FF", fontSize: 11, fontWeight: "700" }}>{notice.title} ?</Text>
                  </Pressable>
                ))}
              </View>
              {noticeKey ? (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#2B335A",
                    backgroundColor: "#0A0D1F",
                    borderRadius: 10,
                    padding: 8,
                  }}
                >
                  <Text style={{ color: "#C7D3FF", fontSize: 12 }}>
                    {NOTICES.find((notice) => notice.key === noticeKey)?.text ?? ""}
                  </Text>
                </View>
              ) : null}
              <ScrollView style={{ maxHeight: 320 }}>
                <View style={{ gap: 10 }}>
                  {selectedExercises.map((exercise) => (
                    <View
                      key={exercise.id}
                      style={{
                        borderWidth: 1,
                        borderColor: "#1D2040",
                        borderRadius: 12,
                        padding: 10,
                        gap: 8,
                        backgroundColor: "#07091a",
                      }}
                    >
                      <Text style={{ color: "#E8E9F5", fontWeight: "700" }}>{exercise.name}</Text>

                      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                        {EXERCISE_TEMPLATES.map((template) => (
                          <AppButton
                            key={`${exercise.id}-${template.id}`}
                            label={template.label}
                            variant="ghost"
                            onPress={() => applyTemplateToExercise(exercise.id, template.id)}
                          />
                        ))}
                      </View>

                      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                        <TextInput
                          value={exercise.sets ?? ""}
                          onChangeText={(value) => updateExerciseOption(exercise.id, "sets", value)}
                          placeholder="Series (optionnel, ex: 4)"
                          placeholderTextColor="#7B80A4"
                          style={inputSmall}
                        />
                        <TextInput
                          value={exercise.reps ?? ""}
                          onChangeText={(value) => updateExerciseOption(exercise.id, "reps", value)}
                          placeholder="Reps (optionnel, ex: 8-10)"
                          placeholderTextColor="#7B80A4"
                          style={inputSmall}
                        />
                        <TextInput
                          value={exercise.tempo ?? ""}
                          onChangeText={(value) => updateExerciseOption(exercise.id, "tempo", value)}
                          placeholder="Tempo (optionnel, ex: 3-1-1-0)"
                          placeholderTextColor="#7B80A4"
                          style={inputSmall}
                        />
                        <TextInput
                          value={exercise.rpe ?? ""}
                          onChangeText={(value) => updateExerciseOption(exercise.id, "rpe", value)}
                          placeholder="RPE (optionnel, ex: 8)"
                          placeholderTextColor="#7B80A4"
                          style={inputSmall}
                        />
                        <TextInput
                          value={exercise.rir ?? ""}
                          onChangeText={(value) => updateExerciseOption(exercise.id, "rir", value)}
                          placeholder="RIR (optionnel, ex: 2)"
                          placeholderTextColor="#7B80A4"
                          style={inputSmall}
                        />
                        <TextInput
                          value={exercise.restSeconds ?? ""}
                          onChangeText={(value) => updateExerciseOption(exercise.id, "restSeconds", value)}
                          placeholder="Repos sec (optionnel, ex: 90)"
                          placeholderTextColor="#7B80A4"
                          style={inputSmall}
                        />
                      </View>

                      <Text style={{ color: "#A8B4DF", fontSize: 12 }}>
                        Prescription de charge (facultatif)
                      </Text>
                      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                        {LOAD_TYPE_OPTIONS.map((option) => (
                          <Pressable
                            key={`${exercise.id}-${option.id}`}
                            onPress={() => updateExerciseOption(exercise.id, "loadType", option.id)}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 7,
                              borderRadius: 999,
                              borderWidth: 1,
                              borderColor: exercise.loadType === option.id ? "#8B8FFF" : "#1D2040",
                              backgroundColor: exercise.loadType === option.id ? "#181D44" : "#0A0D1F",
                            }}
                          >
                            <Text style={{ color: "#E8E9F5", fontSize: 12, fontWeight: "600" }}>{option.label}</Text>
                          </Pressable>
                        ))}
                      </View>
                      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                        <TextInput
                          value={exercise.loadType ?? ""}
                          onChangeText={(value) => updateExerciseOption(exercise.id, "loadType", value)}
                          placeholder="Methode charge (optionnel, ex: kg / %1RM / BW / RPE)"
                          placeholderTextColor="#7B80A4"
                          style={inputMedium}
                        />
                        <TextInput
                          value={exercise.loadValue ?? ""}
                          onChangeText={(value) => updateExerciseOption(exercise.id, "loadValue", value)}
                          placeholder="Valeur charge (optionnel, ex: 60kg ou 75%)"
                          placeholderTextColor="#7B80A4"
                          style={inputMedium}
                        />
                        <TextInput
                          value={exercise.rmRef ?? ""}
                          onChangeText={(value) => updateExerciseOption(exercise.id, "rmRef", value)}
                          placeholder="Reference RM (optionnel, ex: 75% 1RM)"
                          placeholderTextColor="#7B80A4"
                          style={inputMedium}
                        />
                      </View>
                      <Text style={{ color: "#8796C7", fontSize: 11 }}>
                        Exemple: methode "%1RM" + valeur "75" + reference "1RM squat test Janvier".
                      </Text>

                      <TextInput
                        value={exercise.warmupSets ?? ""}
                        onChangeText={(value) => updateExerciseOption(exercise.id, "warmupSets", value)}
                        placeholder="Echauffement (optionnel, ex: 2x10 leger)"
                        placeholderTextColor="#7B80A4"
                        style={inputFull}
                      />
                      <TextInput
                        value={exercise.progressionRule ?? ""}
                        onChangeText={(value) => updateExerciseOption(exercise.id, "progressionRule", value)}
                        placeholder="Regle de progression (optionnel, ex: +2.5kg si 2x10 valide)"
                        placeholderTextColor="#7B80A4"
                        style={inputFull}
                      />
                      <TextInput
                        value={exercise.cues ?? ""}
                        onChangeText={(value) => updateExerciseOption(exercise.id, "cues", value)}
                        placeholder="Cues coaching (optionnel)"
                        placeholderTextColor="#7B80A4"
                        style={inputFull}
                      />
                      <TextInput
                        value={exercise.notes ?? ""}
                        onChangeText={(value) => updateExerciseOption(exercise.id, "notes", value)}
                        placeholder="Notes (optionnel)"
                        placeholderTextColor="#7B80A4"
                        style={[inputFull, { minHeight: 72 }]}
                        multiline
                      />
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : null}

          <AppButton label={t(locale, "builder.program.save")} onPress={handleSaveProgram} />
        </View>
      </AppCard>
    </Screen>
  );
}

const inputSmall = {
  minWidth: 140,
  height: 42,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#1D2040",
  backgroundColor: "#0A0D1F",
  color: "#E8E9F5",
  paddingHorizontal: 10,
  fontSize: 13,
} as const;

const inputMedium = {
  minWidth: 200,
  height: 42,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#1D2040",
  backgroundColor: "#0A0D1F",
  color: "#E8E9F5",
  paddingHorizontal: 10,
  fontSize: 13,
} as const;

const inputFull = {
  height: 42,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#1D2040",
  backgroundColor: "#0A0D1F",
  color: "#E8E9F5",
  paddingHorizontal: 10,
  fontSize: 13,
} as const;
