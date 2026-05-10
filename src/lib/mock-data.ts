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
      "A grounding morning routine designed to start the day with clarity, calm, and intentional priorities.",
    focus: "Mindful kick-off",
    color: "#47626c",
    shortLabel: "AM",
    frequency: "Every Day",
    active: true,
    items: [
      {
        id: "morning-breathing",
        label: "15-minute meditation",
        category: "Health",
        description:
          "Use a slower breathing rhythm to reduce mental noise before the workday begins.",
        window: "06.00 - 07.00",
      },
      {
        id: "morning-gratitude",
        label: "Write 3 gratitude notes",
        category: "Personal",
        description:
          "Capture three positive moments to create a steadier and more optimistic tone for the day.",
        window: "07.00 - 07.30",
      },
      {
        id: "morning-priority",
        label: "Review top priorities",
        category: "Work",
        description:
          "Make the most important outcomes visible before the rest of the agenda takes over.",
        window: "08.00 - 08.20",
      },
      {
        id: "morning-hydration",
        label: "Drink 2L of water",
        category: "Health",
        description:
          "A simple habit that helps keep energy levels steady throughout the day.",
        window: "All day",
      },
    ],
  },
  {
    id: "template-workday-focus",
    name: "Workday Focus",
    description:
      "A workday template built to protect productive rhythm, reduce context switching, and surface blockers early.",
    focus: "Execution flow",
    color: "#a16f54",
    shortLabel: "WK",
    frequency: "Weekdays",
    active: false,
    items: [
      {
        id: "work-deep-focus",
        label: "90 minutes of deep work",
        category: "Work",
        description: "Reserve uninterrupted focus time for the most valuable work on your list.",
        window: "09.00 - 10.30",
      },
      {
        id: "work-blocker-check",
        label: "Log blockers",
        category: "Work",
        description: "Capture obstacles early so they do not remain hidden until late in the day.",
        window: "11.00 - 11.15",
      },
      {
        id: "work-team-sync",
        label: "Send team update",
        category: "Team",
        description:
          "Keep progress visible without creating repeated manual follow-ups.",
        window: "15.00 - 15.30",
      },
    ],
  },
  {
    id: "template-weekend-reset",
    name: "Weekend Reset",
    description:
      "A lighter weekend reset for recovery, reflection, and a more intentional close to the week.",
    focus: "Reflection",
    color: "#5b7f68",
    shortLabel: "WE",
    frequency: "Weekend",
    active: false,
    items: [
      {
        id: "weekend-walk",
        label: "30-minute mindful walk",
        category: "Health",
        description:
          "Use light movement to release tension after a demanding week.",
        window: "Morning / Evening",
      },
      {
        id: "weekend-reflect",
        label: "Reflect on the current week",
        category: "Personal",
        description:
          "Review what worked well and what should be simplified for next week.",
        window: "18.00 - 19.00",
      },
      {
        id: "weekend-plan",
        label: "Plan next week",
        category: "Planning",
        description:
          "Start Monday with a calmer mind and a clearer sense of direction.",
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
  return new Intl.DateTimeFormat("en-US", options).format(date);
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
      '"Small habits practiced consistently create stronger progress than large goals pursued in a rush."',
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
      { label: "Completed this week", value: "28 checklist items" },
      { label: "Most consistent habit", value: "Morning meditation" },
      { label: "Most used template", value: "Morning Routine" },
    ],
    monthlyPreview: {
      title: "Consistency is up by 14%",
      description:
        "Checklist completion improved versus the previous period, especially across the morning routine.",
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
        value: "Keep the start of the day stable and focused",
        description:
          "This template is well suited to personal productivity and daily self-regulation.",
      },
      {
        title: "Default cadence",
        value: "4 items per day",
        description:
          "The item count stays intentionally light so it feels manageable while still creating momentum.",
      },
      {
        title: "Recommended schedule",
        value: "Monday through Friday",
        description:
          "A strong default template for the daily dashboard during the workweek.",
      },
      {
        title: "Tone",
        value: "Calm, reflective, and actionable",
        description:
          "The checklist language stays concise so each item is easy to scan at the start of the day.",
      },
    ],
  };
}

export function getWeeklyReportSnapshot() {
  const days = weekDays();

  return {
    heading: `Weekly Tracking ${formatDate(days[0].fullDate, {
      day: "numeric",
      month: "long",
    })} - ${formatDate(days[6].fullDate, {
      day: "numeric",
      month: "long",
    })}`,
    days,
    metrics: [
      { label: "Completion rate", value: "82%" },
      { label: "Templates used", value: "3" },
      { label: "Longest streak", value: "6 days" },
      { label: "Recovery day", value: "Wednesday" },
    ],
    rows: [
      {
        name: "Morning Meditation",
        color: "#47626c",
        completion: [true, true, true, false, true, true, true],
      },
      {
        name: "Gratitude Journal",
        color: "#a16f54",
        completion: [true, false, true, true, true, false, true],
      },
      {
        name: "Priority Review",
        color: "#89a8b2",
        completion: [true, true, true, true, true, true, false],
      },
      {
        name: "Drink 2L of Water",
        color: "#5b7f68",
        completion: [false, true, false, true, false, true, true],
      },
    ],
    dailyNotes: [
      {
        day: "Monday",
        completion: "4/4 completed",
        note: "The week started strongly because the morning block remained protected and spacious.",
      },
      {
        day: "Wednesday",
        completion: "2/4 completed",
        note: "Unexpected meetings disrupted the rhythm, making it a useful day to review buffer time.",
      },
      {
        day: "Friday",
        completion: "4/4 completed",
        note: "The workday template kept focus steady even with a tightly packed schedule.",
      },
    ],
    insight: {
      title: "The strongest pattern appears when the morning checklist is completed before 8:30 AM",
      description:
        "When the first two items finish early, the likelihood of completing the rest of the checklist on the same day rises significantly.",
      items: [
        "Protect a calm morning block",
        "Reduce non-essential items on Wednesdays",
        "Activate the Workday template on heavy meeting days",
      ],
    },
  };
}

export function getMonthlyReportSnapshot() {
  return {
    summary: {
      totalCompleted: 128,
      period: formatDate(today, { month: "long", year: "numeric" }),
      change: "+14% versus last month",
      dailyAverage: 4.2,
    },
    bars: monthlyBars(),
    heatmap: monthlyHeatmap(),
    wins: [
      {
        label: "Most consistent day",
        value: "Tuesday",
        description:
          "Tuesday delivered the highest and most stable checklist completion pattern.",
      },
      {
        label: "Best recovery template",
        value: "Weekend Reset",
        description:
          "This template helped restore momentum when midweek consistency started to dip.",
      },
      {
        label: "Dominant focus",
        value: "Morning clarity",
        description:
          "Most completed checklist items came from activities started before the formal workday.",
      },
    ],
    templateSpotlight: {
      name: "Morning Routine",
      description:
        "This template was used most often and delivered the highest completion rate this month.",
      tags: ["4 items", "Daily", "Best completion"],
    },
  };
}

export async function getDashboardStatus() {
  const db = getDb();

  if (!db) {
    return {
      label: "Demo Data",
      description: "The interface runs fully even when DATABASE_URL has not been configured yet.",
    };
  }

  try {
    await db.execute(sql`select 1`);

    return {
      label: "Neon Connected",
      description:
        "The project is ready to continue with persistent PostgreSQL integration.",
    };
  } catch {
    return {
      label: "Connection Pending",
      description:
        "DATABASE_URL is present, but the database connection has not been validated successfully yet.",
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
          ? "The day stayed stable and the most important items were completed early."
          : "Extra buffer was needed because the daily rhythm was interrupted.",
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
