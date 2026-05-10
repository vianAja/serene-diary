import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";

export type ChecklistTask = {
  id: string;
  label: string;
  category: string;
  description: string;
  completed: boolean;
  color: string;
  window: string;
};

export type TemplateItem = Omit<ChecklistTask, "completed" | "color">;

export type TemplateDefinition = {
  id: string;
  name: string;
  description: string;
  focus: string;
  color: string;
  shortLabel: string;
  frequency: string;
  active: boolean;
  items: TemplateItem[];
};

const demoUserId = "demo-user";
const today = new Date();

const templateDefinitions: TemplateDefinition[] = [
  {
    id: "template-morning-routine",
    name: "Morning Routine",
    description:
      "Rutinitas pagi yang membantu membuka hari dengan fokus, tenang, dan sadar prioritas.",
    focus: "Mindful kick-off",
    color: "#47626c",
    shortLabel: "AM",
    frequency: "Setiap Hari",
    active: true,
    items: [
      {
        id: "morning-breathing",
        label: "Meditasi 15 menit",
        category: "Health",
        description:
          "Tarik napas lebih pelan untuk menurunkan noise mental sebelum kerja.",
        window: "06.00 - 07.00",
      },
      {
        id: "morning-gratitude",
        label: "Jurnal 3 rasa syukur",
        category: "Personal",
        description:
          "Mencatat 3 hal baik agar ritme hari tetap lebih stabil dan positif.",
        window: "07.00 - 07.30",
      },
      {
        id: "morning-priority",
        label: "Review prioritas utama",
        category: "Work",
        description:
          "Pastikan target yang paling penting terlihat sebelum agenda lain masuk.",
        window: "08.00 - 08.20",
      },
      {
        id: "morning-hydration",
        label: "Minum 2L air",
        category: "Health",
        description:
          "Kebiasaan kecil yang membantu energi tetap stabil sepanjang hari.",
        window: "All day",
      },
    ],
  },
  {
    id: "template-workday-focus",
    name: "Workday Focus",
    description:
      "Template untuk menjaga ritme produktif, mengurangi context switching, dan menangkap blocker.",
    focus: "Execution flow",
    color: "#a16f54",
    shortLabel: "WK",
    frequency: "Hari Kerja",
    active: false,
    items: [
      {
        id: "work-deep-focus",
        label: "90 menit deep work",
        category: "Work",
        description: "Blok fokus tanpa meeting untuk pekerjaan paling bernilai.",
        window: "09.00 - 10.30",
      },
      {
        id: "work-blocker-check",
        label: "Catat blocker",
        category: "Work",
        description: "Supaya hambatan tidak tersimpan diam-diam sampai sore.",
        window: "11.00 - 11.15",
      },
      {
        id: "work-team-sync",
        label: "Sync update ke tim",
        category: "Team",
        description:
          "Buat progress terlihat tanpa perlu follow-up manual berulang.",
        window: "15.00 - 15.30",
      },
    ],
  },
  {
    id: "template-weekend-reset",
    name: "Weekend Reset",
    description:
      "Dipakai untuk evaluasi ringan, recovery energi, dan menutup minggu dengan sadar.",
    focus: "Reflection",
    color: "#5b7f68",
    shortLabel: "WE",
    frequency: "Akhir Pekan",
    active: false,
    items: [
      {
        id: "weekend-walk",
        label: "Jalan santai 30 menit",
        category: "Health",
        description:
          "Gerak ringan untuk melepas ketegangan setelah minggu yang sibuk.",
        window: "Pagi / Sore",
      },
      {
        id: "weekend-reflect",
        label: "Refleksi minggu berjalan",
        category: "Personal",
        description:
          "Apa yang bekerja, apa yang perlu disederhanakan minggu depan.",
        window: "18.00 - 19.00",
      },
      {
        id: "weekend-plan",
        label: "Susun agenda minggu depan",
        category: "Planning",
        description:
          "Masuk Senin dengan pikiran yang lebih lapang dan terarah.",
        window: "19.00 - 19.30",
      },
    ],
  },
];

const checklistTasks: ChecklistTask[] = templateDefinitions[0].items.map(
  (item, index) => ({
    ...item,
    completed: index < 2,
    color: index % 2 === 0 ? "#47626c" : "#a16f54",
  }),
);

function formatDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("id-ID", options).format(date);
}

function makeDateOffset(base: Date, offset: number) {
  const next = new Date(base);
  next.setDate(base.getDate() + offset);
  return next;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function weekDays() {
  const start = makeDateOffset(today, -3);

  return Array.from({ length: 7 }, (_, index) => {
    const day = makeDateOffset(start, index);

    return {
      label: formatDate(day, { weekday: "short" }).replace(".", ""),
      date: formatDate(day, { day: "2-digit" }),
      fullDate: day,
    };
  });
}

function monthlyBars() {
  return [
    { label: "W1", value: 46 },
    { label: "W2", value: 72 },
    { label: "W3", value: 88 },
    { label: "W4", value: 67 },
  ];
}

function monthlyHeatmap() {
  const cells = [];
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const totalDays = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();
  const tones = ["#ece7df", "#dbe6ea", "#89a8b2", "#47626c"];

  for (let index = 0; index < totalDays; index += 1) {
    const day = makeDateOffset(firstDay, index);
    const tone = tones[(index * 7 + 3) % tones.length];

    cells.push({
      id: `heat-${index}`,
      tone,
      label: formatDate(day, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    });
  }

  return cells;
}

export function getHeaderDateLabel() {
  return formatDate(today, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getDailyDashboardSnapshot() {
  const total = checklistTasks.length;
  const completed = checklistTasks.filter((task) => task.completed).length;
  const progress = Math.round((completed / total) * 100);

  return {
    heading: `${formatDate(today, {
      weekday: "long",
      day: "numeric",
      month: "long",
    })} Checklist`,
    quote:
      '"Konsistensi kecil yang dirawat tenang akan terasa jauh lebih kuat daripada target besar yang terburu-buru."',
    progress,
    progressLabel: `${progress}%`,
    streakDays: 12,
    checklist: checklistTasks,
    activeTemplate: {
      name: templateDefinitions[0].name,
      description: templateDefinitions[0].description,
      tags: ["Health", "Personal", "Work"],
    },
    highlights: [
      { label: "Selesai minggu ini", value: "28 checklist" },
      { label: "Kebiasaan paling stabil", value: "Meditasi pagi" },
      { label: "Template favorit", value: "Morning Routine" },
    ],
    monthlyPreview: {
      title: "Konsistensi naik 14%",
      description:
        "Ritme penyelesaian checklist meningkat dibanding periode sebelumnya, terutama di pagi hari.",
    },
  };
}

export function getTemplateManagementSnapshot() {
  return {
    templates: templateDefinitions,
    focusTemplate: templateDefinitions[0],
    editorCards: [
      {
        title: "Objective",
        value: "Menjaga pola awal hari tetap stabil",
        description:
          "Template ini cocok untuk personal productivity dan self-regulation harian.",
      },
      {
        title: "Default cadence",
        value: "4 item / hari",
        description:
          "Jumlah item cukup pendek agar tidak terasa berat, tapi tetap memberi sense of progress.",
      },
      {
        title: "Recommended apply",
        value: "Senin sampai Jumat",
        description:
          "Bisa dijadikan default template aktif di dashboard harian saat hari kerja.",
      },
      {
        title: "Tone",
        value: "Calm, reflective, and actionable",
        description:
          "Bahasa checklist disusun singkat agar cepat dibaca saat pengguna baru membuka dashboard.",
      },
    ],
  };
}

export function getWeeklyReportSnapshot() {
  const days = weekDays();

  return {
    heading: `Tracking Mingguan ${formatDate(days[0].fullDate, {
      day: "numeric",
      month: "long",
    })} - ${formatDate(days[6].fullDate, {
      day: "numeric",
      month: "long",
    })}`,
    days,
    metrics: [
      { label: "Completion rate", value: "82%" },
      { label: "Template used", value: "3" },
      { label: "Longest streak", value: "6 hari" },
      { label: "Recovery day", value: "Rabu" },
    ],
    rows: [
      {
        name: "Meditasi Pagi",
        color: "#47626c",
        completion: [true, true, true, false, true, true, true],
      },
      {
        name: "Jurnal Syukur",
        color: "#a16f54",
        completion: [true, false, true, true, true, false, true],
      },
      {
        name: "Review Prioritas",
        color: "#89a8b2",
        completion: [true, true, true, true, true, true, false],
      },
      {
        name: "Minum 2L Air",
        color: "#5b7f68",
        completion: [false, true, false, true, false, true, true],
      },
    ],
    dailyNotes: [
      {
        day: "Senin",
        completion: "4/4 selesai",
        note: "Mulai minggu dengan sangat baik karena blok pagi masih cukup lapang.",
      },
      {
        day: "Rabu",
        completion: "2/4 selesai",
        note: "Ada meeting mendadak yang menggeser ritme. Cocok jadi hari evaluasi buffer.",
      },
      {
        day: "Jumat",
        completion: "4/4 selesai",
        note: "Template workday membantu menjaga fokus meski agenda padat.",
      },
    ],
    insight: {
      title: "Pola terbaik muncul saat checklist pagi selesai sebelum jam 08.30",
      description:
        "Ketika dua item pertama tuntas lebih awal, kemungkinan checklist lain selesai di hari yang sama meningkat cukup besar.",
      items: [
        "Pertahankan blok tenang di pagi hari",
        "Kurangi item non-esensial di Rabu",
        "Aktifkan template Workday di hari meeting padat",
      ],
    },
  };
}

export function getMonthlyReportSnapshot() {
  return {
    summary: {
      totalCompleted: 128,
      period: formatDate(today, { month: "long", year: "numeric" }),
      change: "+14% dibanding bulan sebelumnya",
      dailyAverage: 4.2,
    },
    bars: monthlyBars(),
    heatmap: monthlyHeatmap(),
    wins: [
      {
        label: "Hari paling konsisten",
        value: "Selasa",
        description:
          "Pola penyelesaian checklist tertinggi dan paling stabil ada di hari Selasa.",
      },
      {
        label: "Recovery terbaik",
        value: "Weekend Reset",
        description:
          "Template ini membantu mengembalikan ritme saat pertengahan minggu sempat menurun.",
      },
      {
        label: "Fokus dominan",
        value: "Morning clarity",
        description:
          "Mayoritas checklist yang selesai datang dari aktivitas yang dimulai sebelum jam kerja.",
      },
    ],
    templateSpotlight: {
      name: "Morning Routine",
      description:
        "Template ini paling sering dipakai dan menghasilkan completion rate tertinggi pada bulan ini.",
      tags: ["4 item", "Everyday", "Best completion"],
    },
  };
}

export async function getDashboardStatus() {
  const db = getDb();

  if (!db) {
    return {
      label: "Demo Data",
      description: "UI jalan penuh meski DATABASE_URL belum diisi.",
    };
  }

  try {
    await db.execute(sql`select 1`);

    return {
      label: "Neon Connected",
      description:
        "Project siap melanjutkan integrasi persistence ke PostgreSQL.",
    };
  } catch {
    return {
      label: "Connection Pending",
      description:
        "DATABASE_URL ada, tapi koneksi database belum berhasil divalidasi.",
    };
  }
}

export function buildDatabaseSeed() {
  const templates = templateDefinitions.map((template) => ({
    id: template.id,
    userId: demoUserId,
    name: template.name,
    description: template.description,
    focus: template.focus,
    color: template.color,
    shortLabel: template.shortLabel,
    frequency: template.frequency,
    isActive: template.active,
  }));

  const templateItems = templateDefinitions.flatMap((template) =>
    template.items.map((item, index) => ({
      id: item.id,
      templateId: template.id,
      label: item.label,
      category: item.category,
      description: item.description,
      window: item.window,
      position: index,
    })),
  );

  const checklists = Array.from({ length: 14 }, (_, index) => {
    const template =
      index % 6 === 0 ? templateDefinitions[2] : templateDefinitions[0];
    const checklistDate = makeDateOffset(today, -index);
    const progress = [50, 100, 75, 100, 75, 50, 100][index % 7];

    return {
      id: `checklist-${index + 1}`,
      userId: demoUserId,
      templateId: template.id,
      title: `${formatDate(checklistDate, {
        weekday: "long",
      })} Checklist`,
      checklistDate: toIsoDate(checklistDate),
      progress,
      note:
        progress >= 75
          ? "Hari berjalan cukup stabil dan item penting selesai lebih awal."
          : "Perlu buffer tambahan karena ritme harian sempat terputus.",
    };
  });

  const entries = checklists.flatMap((checklist, checklistIndex) => {
    const template =
      checklist.templateId === templateDefinitions[2].id
        ? templateDefinitions[2]
        : templateDefinitions[0];

    return template.items.map((item, itemIndex) => {
      const completed = (checklistIndex + itemIndex) % 3 !== 0;

      return {
        id: `${checklist.id}-${item.id}`,
        checklistId: checklist.id,
        templateItemId: item.id,
        label: item.label,
        category: item.category,
        description: item.description,
        window: item.window,
        completed,
        position: itemIndex,
        completedAt: completed ? makeDateOffset(today, -checklistIndex) : null,
      };
    });
  });

  return { templates, templateItems, checklists, entries };
}
