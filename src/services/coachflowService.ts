import { supabase } from "../lib/supabaseClient";
import type { CoachflowClient, CoachflowMessage } from "../mocks/coachflow";
import { clients as mockClients, chatMessages as mockChatMessages } from "../mocks/coachflow";

type ProfileRow = {
  id: string;
  full_name: string | null;
  email?: string | null;
  role: "coach" | "client";
};

type LinkRow = {
  coach_id: string;
  client_id: string;
};

type ProgramRow = {
  id: string;
  client_id: string;
  title: string;
};

type ProgramSessionRow = {
  id: string;
  day?: string;
  focus: string;
  exercises: unknown;
};

type MessageRow = {
  id: string;
  coach_id: string;
  client_id: string;
  sender: "coach" | "client";
  content: string;
  created_at: string;
  read_at: string | null;
};

export type ConversationSummary = {
  peerId: string;
  peerName: string;
  peerAvatarUrl: string;
  unreadCount: number;
  lastMessage: string;
};

export type ClientCoachSummary = {
  id: string;
  name: string;
  email: string | null;
  status: string;
  avatarUrl: string;
};

type InvitationRow = {
  id: string;
  coach_id: string;
  client_email: string;
  client_id: string | null;
  status: string;
  message: string | null;
  created_at: string;
  responded_at: string | null;
};

export type CoachInvitation = {
  id: string;
  coachId: string;
  coachName: string;
  clientEmail: string;
  status: string;
  message: string | null;
  createdAt: string;
};

function seededValue(seed: string, min: number, max: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const normalized = Math.abs(hash % 1000) / 1000;
  return Math.round(min + normalized * (max - min));
}

function avatarForIndex(index: number) {
  return `https://i.pravatar.cc/300?img=${(index % 60) + 1}`;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function toCoachflowClient(profile: ProfileRow, index: number): CoachflowClient {
  const progressKg = seededValue(profile.id + "kg", 1, 4) / 1.0;
  const progressPct = seededValue(profile.id + "pct", 1, 5) / 1.0;
  const weightKg = seededValue(profile.id + "w", 56, 94);

  const firstName = (profile.full_name ?? "Client").split(" ")[0] ?? "Client";
  const subtitle = `${seededValue(profile.id + "age", 22, 48)} ans - suivi ${firstName.toLowerCase()}`;

  return {
    id: profile.id,
    name: profile.full_name ?? "Client",
    subtitle,
    progressKg,
    progressPct,
    weightKg,
    objective: "Perte de poids",
    avatarUrl: avatarForIndex(index),
    heroUrl: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=1200&q=80",
    mensurations: {
      taille: seededValue(profile.id + "t", 68, 92),
      hanches: seededValue(profile.id + "h", 84, 108),
    },
    chart: [100, 93, 86, 79, 73, 69, 64].map((v) => v + seededValue(profile.id + String(v), -6, 6)),
    sessions: [
      { id: "s1", label: "Full Body", sets: "3 series de 12", done: true },
      { id: "s2", label: "Cardio", sets: "25 min", done: seededValue(profile.id, 0, 1) === 1 },
      { id: "s3", label: "Mobilite", sets: "15 min", done: false },
    ],
  };
}

export async function getCurrentUserRole() {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return null;

  const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (data?.role) {
    return data.role as "coach" | "client";
  }
  const metadataRole = userData.user?.user_metadata?.role;
  if (metadataRole === "coach" || metadataRole === "client") {
    return metadataRole;
  }
  return null;
}

async function getAuthIdentity() {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) {
    return { userId: null, role: null as "coach" | "client" | null, user: null };
  }
  const role = await getCurrentUserRole();
  return { userId, role, user: userData.user };
}

export async function fetchCoachflowClients(): Promise<CoachflowClient[]> {
  const { userId, role, user } = await getAuthIdentity();

  if (!userId) {
    return mockClients;
  }

  if (role === "coach") {
    const { data: links } = await supabase
      .from("coach_clients")
      .select("coach_id, client_id")
      .eq("coach_id", userId);

    const clientIds = ((links ?? []) as LinkRow[]).map((item) => item.client_id);
    if (!clientIds.length) return [];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("id", clientIds)
      .eq("role", "client");

    return ((profiles ?? []) as ProfileRow[]).map((profile, index) => toCoachflowClient(profile, index));
  }

  if (role === "client") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      const fullNameFromMeta =
        typeof user?.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
          ? user.user_metadata.full_name.trim()
          : null;
      const emailFallback =
        typeof user?.email === "string" && user.email.includes("@")
          ? user.email.split("@")[0].replace(/[._-]+/g, " ").trim()
          : "Client";

      return [
        toCoachflowClient(
          {
            id: userId,
            full_name: fullNameFromMeta ?? emailFallback,
            role: "client",
          },
          0,
        ),
      ];
    }
    return [toCoachflowClient(profile as ProfileRow, 0)];
  }

  return [];
}

export async function fetchClientProgram(clientId: string, coachId?: string) {
  let query = supabase
    .from("programs")
    .select("id, client_id, title")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (coachId && isUuid(coachId)) {
    query = query.eq("coach_id", coachId);
  }

  const { data: program } = await query.maybeSingle();

  if (!program) {
    const fallbackClient = mockClients.find((c) => c.id === clientId) ?? mockClients[0];
    return {
      title: "Full Body",
      sessions: fallbackClient.sessions,
    };
  }

  const { data: sessions } = await supabase
    .from("program_sessions")
    .select("id, day, focus, exercises")
    .eq("program_id", (program as ProgramRow).id)
    .order("created_at", { ascending: true });

  const mapped = ((sessions ?? []) as ProgramSessionRow[]).flatMap((session) => {
    const exercises = Array.isArray(session.exercises) ? session.exercises : [];
    if (!exercises.length) {
      return [
        {
          id: session.id,
          label: session.focus,
          sets: "3 series",
          done: false,
        },
      ];
    }

    return exercises.map((entry, index) => {
      if (typeof entry === "string") {
        return {
          id: `${session.id}-${index}`,
          label: entry,
          sets: "3 series",
          done: false,
        };
      }

      if (typeof entry === "object" && entry) {
        const record = entry as {
          name?: string;
          label?: string;
          sets?: string;
          reps?: string;
          tempo?: string;
          rpe?: string;
          rest_seconds?: number | string;
          rm_ref?: string;
          rir?: string;
          notes?: string;
        };

        const detailParts: string[] = [];
        if (record.sets && record.reps) {
          detailParts.push(`${record.sets}x${record.reps}`);
        } else if (record.sets) {
          detailParts.push(`${record.sets} series`);
        } else if (record.reps) {
          detailParts.push(`${record.reps} reps`);
        }
        if (record.tempo) detailParts.push(`Tempo ${record.tempo}`);
        if (record.rpe) detailParts.push(`RPE ${record.rpe}`);
        if (record.rir) detailParts.push(`RIR ${record.rir}`);
        if (record.rest_seconds) detailParts.push(`Repos ${record.rest_seconds}s`);
        if (record.rm_ref) detailParts.push(`Base ${record.rm_ref}`);

        return {
          id: `${session.id}-${index}`,
          label: record.name ?? record.label ?? session.focus,
          sets: detailParts.join(" | ") || record.sets || "3 series",
          done: false,
        };
      }

      return {
        id: `${session.id}-${index}`,
        label: session.focus,
        sets: "3 series",
        done: false,
      };
    });
  });

  return {
    title: (program as ProgramRow).title,
    sessions: mapped.length ? mapped : mockClients[0].sessions,
  };
}

export type ProgramExerciseInput = {
  id: string;
  name: string;
  sets?: string;
  reps?: string;
  tempo?: string;
  rpe?: string;
  rir?: string;
  restSeconds?: string;
  loadType?: string;
  loadValue?: string;
  rmRef?: string;
  unilateral?: boolean;
  warmupSets?: string;
  progressionRule?: string;
  notes?: string;
  cues?: string;
};

export async function createProgramForClient(params: {
  clientId: string;
  title: string;
  sessionFocus: string;
  exercises: ProgramExerciseInput[];
  durationWeeks?: number;
}): Promise<{ error: string | null; programId: string | null }> {
  const { userId, role } = await getAuthIdentity();
  if (!userId || role !== "coach") {
    return { error: "Acces reserve aux coachs.", programId: null };
  }

  if (!isUuid(params.clientId)) {
    return { error: "Client invalide.", programId: null };
  }

  const title = params.title.trim();
  if (!title) {
    return { error: "Titre programme requis.", programId: null };
  }

  const focus = params.sessionFocus.trim() || "Seance du jour";
  const normalizedExercises = params.exercises
    .map((exercise) => ({
      id: exercise.id.trim(),
      name: exercise.name.trim(),
      sets: exercise.sets?.trim() || "",
      reps: exercise.reps?.trim() || "",
      tempo: exercise.tempo?.trim() || "",
      rpe: exercise.rpe?.trim() || "",
      rir: exercise.rir?.trim() || "",
      rest_seconds: exercise.restSeconds?.trim() || "",
      load_type: exercise.loadType?.trim() || "",
      load_value: exercise.loadValue?.trim() || "",
      rm_ref: exercise.rmRef?.trim() || "",
      unilateral: Boolean(exercise.unilateral),
      warmup_sets: exercise.warmupSets?.trim() || "",
      progression_rule: exercise.progressionRule?.trim() || "",
      notes: exercise.notes?.trim() || "",
      cues: exercise.cues?.trim() || "",
    }))
    .filter((exercise) => Boolean(exercise.name))
    .slice(0, 25);

  if (!normalizedExercises.length) {
    return { error: "Ajoutez au moins un exercice.", programId: null };
  }

  const { data: program, error: programError } = await supabase
    .from("programs")
    .insert({
      coach_id: userId,
      client_id: params.clientId,
      title,
      duration_weeks: params.durationWeeks ?? 8,
    })
    .select("id")
    .single();

  if (programError || !program?.id) {
    return { error: programError?.message ?? "Creation programme impossible.", programId: null };
  }

  const exercisesPayload = normalizedExercises.map((exercise) => ({
    variant_id: exercise.id || null,
    name: exercise.name,
    sets: exercise.sets || "",
    reps: exercise.reps || "",
    tempo: exercise.tempo || "",
    rpe: exercise.rpe || "",
    rir: exercise.rir || "",
    rest_seconds: exercise.rest_seconds || "",
    load_type: exercise.load_type || "",
    load_value: exercise.load_value || "",
    rm_ref: exercise.rm_ref || "",
    unilateral: exercise.unilateral,
    warmup_sets: exercise.warmup_sets || "",
    progression_rule: exercise.progression_rule || "",
    notes: exercise.notes || "",
    cues: exercise.cues || "",
  }));

  const { error: sessionError } = await supabase.from("program_sessions").insert({
    program_id: program.id,
    day: "Jour 1",
    focus,
    exercises: exercisesPayload,
  });

  if (sessionError) {
    return { error: sessionError.message, programId: null };
  }

  return { error: null, programId: program.id as string };
}

function formatMessages(rows: MessageRow[]): CoachflowMessage[] {
  return rows.map((message) => ({
    id: message.id,
    sender: message.sender,
    text: message.content,
    time: new Date(message.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  }));
}

export async function fetchConversationSummaries(): Promise<ConversationSummary[]> {
  const { userId, role } = await getAuthIdentity();
  if (!userId || !role) {
    return mockClients.map((client) => ({
      peerId: client.id,
      peerName: client.name,
      peerAvatarUrl: client.avatarUrl,
      unreadCount: 0,
      lastMessage: "Aucun message",
    }));
  }

  if (role === "coach") {
    const clients = await fetchCoachflowClients();
    const clientIds = clients.map((client) => client.id).filter(isUuid);

    if (!clientIds.length) {
      const { data: me } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();

      const { data: selfMsgs } = await supabase
        .from("messages")
        .select("content, sender, read_at, created_at")
        .eq("coach_id", userId)
        .eq("client_id", userId)
        .order("created_at", { ascending: false });

      const selfRows = (selfMsgs ?? []) as Array<{
        content: string;
        sender: "coach" | "client";
        read_at: string | null;
        created_at: string;
      }>;

      return [
        {
          peerId: userId,
          peerName: (me?.full_name ? `${me.full_name} (Demo)` : "Conversation Demo"),
          peerAvatarUrl: avatarForIndex(41),
          unreadCount: selfRows.filter((row) => row.sender === "client" && !row.read_at).length,
          lastMessage: selfRows[0]?.content ?? "Envoyez un premier message pour tester.",
        },
      ];
    }

    const { data } = await supabase
      .from("messages")
      .select("id, coach_id, client_id, sender, content, created_at, read_at")
      .eq("coach_id", userId)
      .in("client_id", clientIds)
      .order("created_at", { ascending: false });

    const rows = (data ?? []) as MessageRow[];

    return clients.map((client) => {
      const thread = rows.filter((row) => row.client_id === client.id);
      const last = thread[0];
      const unread = thread.filter((row) => row.sender === "client" && !row.read_at).length;

      return {
        peerId: client.id,
        peerName: client.name,
        peerAvatarUrl: client.avatarUrl,
        unreadCount: unread,
        lastMessage: last?.content ?? "Aucun message",
      };
    });
  }

  const { data: links } = await supabase
    .from("coach_clients")
    .select("coach_id, client_id")
    .eq("client_id", userId);

  const coachIds = ((links ?? []) as LinkRow[]).map((item) => item.coach_id).filter(isUuid);
  if (!coachIds.length) {
    return [];
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("id", coachIds)
    .eq("role", "coach");

  const coaches = (profiles ?? []) as ProfileRow[];

  const { data: messages } = await supabase
    .from("messages")
    .select("id, coach_id, client_id, sender, content, created_at, read_at")
    .eq("client_id", userId)
    .in("coach_id", coachIds)
    .order("created_at", { ascending: false });

  const rows = (messages ?? []) as MessageRow[];

  return coaches.map((coach, index) => {
    const thread = rows.filter((row) => row.coach_id === coach.id);
    const last = thread[0];
    const unread = thread.filter((row) => row.sender === "coach" && !row.read_at).length;

    return {
      peerId: coach.id,
      peerName: coach.full_name ?? "Coach",
      peerAvatarUrl: avatarForIndex(index + 20),
      unreadCount: unread,
      lastMessage: last?.content ?? "Aucun message",
    };
  });
}

export async function fetchConversationMessages(peerId: string): Promise<CoachflowMessage[]> {
  const { userId, role } = await getAuthIdentity();

  if (!userId || !role) return mockChatMessages["julie-martin"] ?? [];
  if (!peerId || !isUuid(peerId)) return [];

  let query = supabase.from("messages").select("id, coach_id, client_id, sender, content, created_at, read_at");

  if (role === "coach") {
    query = query.eq("coach_id", userId).eq("client_id", peerId);
  } else {
    query = query.eq("client_id", userId).eq("coach_id", peerId);
  }

  const { data } = await query.order("created_at", { ascending: true });
  const rows = (data ?? []) as MessageRow[];
  return rows.length ? formatMessages(rows) : [];
}

export async function markConversationAsRead(peerId: string): Promise<{ error: string | null }> {
  const { userId, role } = await getAuthIdentity();
  if (!userId || !role || !isUuid(peerId)) return { error: null };

  const readAt = new Date().toISOString();

  if (role === "coach") {
    const { error } = await supabase
      .from("messages")
      .update({ read_at: readAt })
      .eq("coach_id", userId)
      .eq("client_id", peerId)
      .eq("sender", "client")
      .is("read_at", null);

    return { error: error?.message ?? null };
  }

  const { error } = await supabase
    .from("messages")
    .update({ read_at: readAt })
    .eq("client_id", userId)
    .eq("coach_id", peerId)
    .eq("sender", "coach")
    .is("read_at", null);

  return { error: error?.message ?? null };
}

export async function sendConversationMessage(peerId: string, content: string): Promise<{ error: string | null }> {
  const { userId, role } = await getAuthIdentity();
  if (!userId || !role) return { error: "Session introuvable." };
  if (!peerId || !isUuid(peerId)) return { error: "Conversation invalide." };

  const payload =
    role === "coach"
      ? { coach_id: userId, client_id: peerId, sender: "coach" as const, content }
      : { coach_id: peerId, client_id: userId, sender: "client" as const, content };

  const { error } = await supabase.from("messages").insert(payload);
  return { error: error?.message ?? null };
}

export async function insertDemoIncomingMessage(peerId: string): Promise<{ error: string | null }> {
  const { userId, role } = await getAuthIdentity();
  if (!userId || !role) return { error: "Session introuvable." };
  if (!peerId || !isUuid(peerId)) return { error: "Conversation invalide." };
  if (role !== "coach" || peerId !== userId) return { error: "Mode demo indisponible." };

  const { error } = await supabase.from("messages").insert({
    coach_id: userId,
    client_id: userId,
    sender: "client",
    content: "Message entrant demo: video envoyee, besoin de feedback.",
  });

  return { error: error?.message ?? null };
}

export async function fetchClientCoaches(): Promise<ClientCoachSummary[]> {
  const { userId, role } = await getAuthIdentity();
  if (!userId || role !== "client") return [];

  const { data: links } = await supabase
    .from("coach_clients")
    .select("coach_id, status")
    .eq("client_id", userId)
    .order("created_at", { ascending: true });

  const rows = (links ?? []) as Array<{ coach_id: string; status?: string | null }>;
  const coachIds = rows.map((row) => row.coach_id).filter(isUuid);
  if (!coachIds.length) return [];

  const { data: coaches } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .in("id", coachIds)
    .eq("role", "coach");

  const coachById = new Map((coaches ?? []).map((coach) => [coach.id, coach as ProfileRow]));

  return rows
    .map((row, index) => {
      const coach = coachById.get(row.coach_id);
      if (!coach) return null;
      return {
        id: coach.id,
        name: coach.full_name ?? "Coach",
        email: coach.email ?? null,
        status: row.status ?? "active",
        avatarUrl: avatarForIndex(index + 30),
      };
    })
    .filter((item): item is ClientCoachSummary => item !== null);
}

export async function createCoachInvitation(
  clientEmail: string,
  message?: string,
): Promise<{ error: string | null; invitation: CoachInvitation | null }> {
  const { userId, role } = await getAuthIdentity();
  if (!userId || role !== "coach") {
    return { error: "Acces reserve aux coachs.", invitation: null };
  }

  const normalizedEmail = clientEmail.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { error: "Email client invalide.", invitation: null };
  }

  const { data, error } = await supabase
    .from("coach_invitations")
    .insert({
      coach_id: userId,
      client_email: normalizedEmail,
      status: "pending",
      message: message?.trim() || null,
    })
    .select("id, coach_id, client_email, client_id, status, message, created_at, responded_at")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Erreur creation invitation.", invitation: null };
  }

  const row = data as InvitationRow;
  return {
    error: null,
    invitation: {
      id: row.id,
      coachId: row.coach_id,
      coachName: "Moi",
      clientEmail: row.client_email,
      status: row.status,
      message: row.message,
      createdAt: row.created_at,
    },
  };
}

export async function fetchCoachSentInvitations(): Promise<CoachInvitation[]> {
  const { userId, role } = await getAuthIdentity();
  if (!userId || role !== "coach") return [];

  const { data } = await supabase
    .from("coach_invitations")
    .select("id, coach_id, client_email, client_id, status, message, created_at, responded_at")
    .eq("coach_id", userId)
    .order("created_at", { ascending: false });

  return ((data ?? []) as InvitationRow[]).map((row) => ({
    id: row.id,
    coachId: row.coach_id,
    coachName: "Moi",
    clientEmail: row.client_email,
    status: row.status,
    message: row.message,
    createdAt: row.created_at,
  }));
}

export async function fetchClientPendingInvitations(): Promise<CoachInvitation[]> {
  const { userId, role } = await getAuthIdentity();
  if (!userId || role !== "client") return [];

  const { data } = await supabase
    .from("coach_invitations")
    .select("id, coach_id, client_email, client_id, status, message, created_at, responded_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as InvitationRow[];
  const coachIds = rows.map((row) => row.coach_id).filter(isUuid);
  if (!coachIds.length) return [];

  const { data: coaches } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .in("id", coachIds)
    .eq("role", "coach");

  const coachNames = new Map((coaches ?? []).map((coach) => [coach.id, coach.full_name ?? "Coach"]));

  return rows.map((row) => ({
    id: row.id,
    coachId: row.coach_id,
    coachName: coachNames.get(row.coach_id) ?? "Coach",
    clientEmail: row.client_email,
    status: row.status,
    message: row.message,
    createdAt: row.created_at,
  }));
}

export async function acceptCoachInvitation(invitationId: string): Promise<{ error: string | null }> {
  if (!isUuid(invitationId)) {
    return { error: "Invitation invalide." };
  }

  const { data, error } = await supabase.rpc("accept_coach_invitation", {
    p_invitation_id: invitationId,
  });

  if (error) {
    return { error: error.message };
  }

  const result = Array.isArray(data) ? data[0] : null;
  if (result && result.success === false) {
    return { error: typeof result.message === "string" ? result.message : "Impossible d'accepter l'invitation." };
  }

  return { error: null };
}
