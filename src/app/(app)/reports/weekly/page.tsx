import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { getWeeklyReportSnapshot } from "@/lib/mock-data";

export default function WeeklyReportPage() {
  const report = getWeeklyReportSnapshot();

  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[30px] p-6 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              Weekly Tracking
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-primary">
              {report.heading}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              This view helps you read consistency patterns across the week
              without losing sight of the habits and routines you are building.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:min-w-[320px]">
            {report.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[22px] border border-outline/70 bg-surface-soft px-4 py-3"
              >
                <p className="text-sm text-muted">{metric.label}</p>
                <p className="mt-1 text-xl font-semibold">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-card rounded-[30px] p-4 md:p-6">
        <div className="overflow-x-auto">
          <div className="min-w-[880px]">
            <div className="grid grid-cols-[240px_repeat(7,minmax(72px,1fr))] gap-3 px-2 py-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              <div className="text-left">Habit / Template</div>
              {report.days.map((day) => (
                <div key={day.label}>
                  <div>{day.label}</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">
                    {day.date}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {report.rows.map((row) => (
                <div
                  key={row.name}
                  className="grid grid-cols-[240px_repeat(7,minmax(72px,1fr))] items-center gap-3 rounded-[24px] border border-outline/70 bg-surface-soft/65 px-2 py-3"
                >
                  <div className="flex items-center gap-3 px-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: row.color }}
                    />
                    <span className="font-semibold text-foreground">
                      {row.name}
                    </span>
                  </div>
                  {row.completion.map((completed, index) => (
                    <div key={`${row.name}-${index}`} className="flex justify-center">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                          completed
                            ? "border-primary bg-primary text-white"
                            : "border-outline bg-white text-muted"
                        }`}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-card rounded-[30px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            Daily Notes
          </p>
          <div className="mt-5 grid gap-3">
            {report.dailyNotes.map((note) => (
              <article
                key={note.day}
                className="rounded-[22px] border border-outline/70 bg-surface-soft px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-semibold text-foreground">{note.day}</h2>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">
                    {note.completion}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-muted">{note.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-primary/10 bg-gradient-to-br from-[#fff8f2] to-white p-6 shadow-[0_20px_50px_rgba(220,192,171,0.16)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            Key Insight
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-primary">
            {report.insight.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            {report.insight.description}
          </p>
          <div className="mt-6 space-y-3">
            {report.insight.items.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-[22px] border border-outline/60 bg-white px-4 py-3"
              >
                <span className="text-sm font-medium text-foreground">{item}</span>
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
