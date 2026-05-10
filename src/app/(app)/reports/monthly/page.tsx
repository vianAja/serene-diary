import { TrendingUp } from "lucide-react";
import { getMonthlyReportSnapshot } from "@/lib/mock-data";

export default function MonthlyReportPage() {
  const report = getMonthlyReportSnapshot();

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <article className="surface-card rounded-[30px] p-6 md:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            Monthly Highlight
          </p>
          <h1 className="mt-3 text-5xl font-bold tracking-[-0.04em] text-primary">
            {report.summary.totalCompleted}
          </h1>
          <p className="mt-2 text-sm leading-7 text-muted">
            checklist terselesaikan sepanjang {report.summary.period}.
          </p>
          <div className="mt-8 flex items-center gap-3 rounded-[22px] bg-secondary/55 px-4 py-4 text-primary">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-semibold">{report.summary.change}</span>
          </div>
        </article>

        <article className="surface-card rounded-[30px] p-6 md:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Consistency Trends
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-primary">
                Weekly Rhythm
              </h2>
            </div>
            <span className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-primary">
              Average {report.summary.dailyAverage} tasks per day
            </span>
          </div>

          <div className="mt-8 flex h-64 items-end gap-3">
            {report.bars.map((bar) => (
              <div key={bar.label} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-full w-full items-end rounded-[18px] bg-surface-soft p-2">
                  <div
                    className="w-full rounded-[14px] bg-gradient-to-b from-primary-soft to-primary"
                    style={{ height: `${bar.value}%` }}
                  />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="surface-card rounded-[30px] p-6 md:p-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Consistency Heatmap
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-primary">
                Sebaran Aktivitas
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              <span>rendah</span>
              {["#ece7df", "#dbe6ea", "#89a8b2", "#47626c"].map((tone) => (
                <span
                  key={tone}
                  className="h-3.5 w-3.5 rounded-[4px]"
                  style={{ backgroundColor: tone }}
                />
              ))}
              <span>tinggi</span>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <div className="grid min-w-max grid-flow-col grid-rows-7 gap-2">
              {report.heatmap.map((cell) => (
                <div
                  key={cell.id}
                  className="h-5 w-5 rounded-[6px]"
                  style={{ backgroundColor: cell.tone }}
                  title={cell.label}
                />
              ))}
            </div>
          </div>
        </section>

        <aside className="grid gap-6">
          <section className="surface-card rounded-[30px] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              Strongest This Month
            </p>
            <div className="mt-5 grid gap-3">
              {report.wins.map((win) => (
                <article
                  key={win.label}
                  className="rounded-[22px] border border-outline/70 bg-surface-soft px-4 py-4"
                >
                  <p className="text-sm text-muted">{win.label}</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {win.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {win.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[30px] border border-primary/10 bg-gradient-to-br from-primary to-primary-soft p-6 text-white shadow-[0_24px_60px_rgba(71,98,108,0.22)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
              Template Champion
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              {report.templateSpotlight.name}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/80">
              {report.templateSpotlight.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {report.templateSpotlight.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
