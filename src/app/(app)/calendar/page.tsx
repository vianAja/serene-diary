import { CalendarPlanner } from "@/components/calendar-planner";
import { getAuthorizedUserId } from "@/lib/authorized-user";
import { getScheduledTasksByDate } from "@/lib/scheduled-tasks";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export default async function CalendarPage() {
  const selectedDate = todayString();
  const userId = await getAuthorizedUserId();
  const tasks = userId ? await getScheduledTasksByDate(selectedDate, userId) : [];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-[32px] font-bold tracking-[-0.02em] text-foreground">
          Calendar
        </h2>
        <p className="mt-2 text-base text-muted">
          Schedule tasks on specific dates, and they will auto-appear in your daily checklist.
        </p>
      </header>
      <CalendarPlanner initialDate={selectedDate} initialTasks={tasks} />
    </div>
  );
}
