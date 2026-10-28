"use client";

import { Minus, Plus, Settings2, X } from "lucide-react";
import { useState } from "react";

export type TahlilReading = {
  title: string;
  note: string;
  repetition: string;
  arabic: string;
  latin: string;
  meaning: string;
};

type TextKind = "arabic" | "latin" | "meaning";

function TextSizeControl({
  label,
  size,
  baseSize,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  size: number;
  baseSize: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const percent = Math.round((size / baseSize) * 100);

  return (
    <div className="rounded-xl border border-outline bg-surface p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="rounded-md bg-surface-soft px-2 py-1 text-xs font-bold tabular-nums text-primary">{percent}%</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, size - step))}
          disabled={size <= min}
          aria-label={`Perkecil tulisan ${label}`}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-outline text-foreground hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="text-xs tabular-nums text-muted">{size} px</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, size + step))}
          disabled={size >= max}
          aria-label={`Perbesar tulisan ${label}`}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-outline text-foreground hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function VisibilityButton({
  label,
  visible,
  onToggle,
}: {
  label: string;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={visible}
      aria-label={`Tampilkan ${label}`}
      className="flex min-h-11 w-full items-center justify-between rounded-lg border border-outline px-3 text-sm font-medium text-foreground hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span>{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${visible ? "bg-primary" : "bg-surface-strong"}`} aria-hidden="true">
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${visible ? "translate-x-6" : "translate-x-1"}`} />
      </span>
    </button>
  );
}

function ReadingCard({
  reading,
  index,
  id,
  sizes,
  showLatin,
  showMeaning,
}: {
  reading: TahlilReading;
  index: string;
  id?: string;
  sizes: Record<TextKind, number>;
  showLatin: boolean;
  showMeaning: boolean;
}) {
  return (
    <article id={id} className="scroll-mt-24 rounded-2xl border border-outline bg-surface p-4 shadow-sm md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="inline-flex min-h-8 items-center rounded-full border border-outline bg-surface-soft px-3 text-xs font-medium text-muted">
            {reading.note || index}
          </span>
          <h2 className="text-sm font-semibold text-foreground">{reading.title}</h2>
        </div>
        <span
          aria-label={`Bacaan ini dibaca ${reading.repetition}`}
          className="inline-flex min-h-8 shrink-0 items-center rounded-full bg-primary-soft/20 px-3 text-xs font-bold text-primary"
        >
          {reading.repetition}
        </span>
      </div>

      <p lang="ar" dir="rtl" className="tahlil-arabic mt-7 break-words text-right text-foreground" style={{ fontSize: `${sizes.arabic}px`, lineHeight: 1.95 }}>
        {reading.arabic}
      </p>

      {showLatin ? (
        <p lang="id-Latn" className="mt-6 whitespace-pre-line break-words text-foreground" style={{ fontSize: `${sizes.latin}px`, lineHeight: 1.75 }}>
          {reading.latin}
        </p>
      ) : null}

      {showMeaning ? (
        <p lang="id" className={`${showLatin ? "mt-4" : "mt-6"} whitespace-pre-line break-words text-muted`} style={{ fontSize: `${sizes.meaning}px`, lineHeight: 1.75 }}>
          {reading.meaning}
        </p>
      ) : null}
    </article>
  );
}

export function TahlilReader({
  readings,
  prayers,
}: {
  readings: TahlilReading[];
  prayers: TahlilReading[];
}) {
  const [sizes, setSizes] = useState<Record<TextKind, number>>({ arabic: 34, latin: 17, meaning: 17 });
  const [showLatin, setShowLatin] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [status, setStatus] = useState("");
  const updateSize = (kind: TextKind, value: number) => setSizes((current) => ({ ...current, [kind]: value }));

  return (
    <div className={`space-y-5 ${settingsOpen ? "xl:pr-[19rem]" : ""}`}>
      <button
        type="button"
        aria-expanded={settingsOpen}
        aria-controls="tahlil-settings-panel"
        onClick={() => setSettingsOpen((open) => !open)}
        className="fixed right-4 top-20 z-50 inline-flex min-h-11 items-center gap-2 rounded-full border border-outline bg-surface px-4 text-sm font-semibold text-foreground shadow-lg hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Settings2 className="h-4 w-4" aria-hidden="true" />
        {settingsOpen ? "Tutup pengaturan" : "Atur teks"}
      </button>

      {settingsOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30 xl:hidden"
            aria-label="Tutup pengaturan tampilan"
            onClick={() => setSettingsOpen(false)}
          />
          <aside
            id="tahlil-settings-panel"
            aria-label="Pengaturan tampilan bacaan"
            className="fixed bottom-0 right-0 top-0 z-50 w-[min(22rem,90vw)] overflow-y-auto border-l border-outline bg-background p-4 pt-20 shadow-2xl sm:bottom-4 sm:right-4 sm:top-20 sm:rounded-2xl sm:border sm:pt-4 xl:bottom-4 xl:top-20"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-foreground">Pengaturan teks</p>
                <p className="mt-1 text-xs text-muted">Persentase dihitung dari ukuran awal.</p>
              </div>
              <button type="button" onClick={() => setSettingsOpen(false)} aria-label="Tutup pengaturan" className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-surface-soft hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-3">
              <TextSizeControl label="Arab" size={sizes.arabic} baseSize={34} min={22} max={58} step={2} onChange={(value) => updateSize("arabic", value)} />
              <TextSizeControl label="Latin" size={sizes.latin} baseSize={17} min={12} max={27} step={1} onChange={(value) => updateSize("latin", value)} />
              <TextSizeControl label="Arti" size={sizes.meaning} baseSize={17} min={12} max={27} step={1} onChange={(value) => updateSize("meaning", value)} />
              <div className="space-y-2 border-t border-outline pt-3">
                <VisibilityButton label="Latin" visible={showLatin} onToggle={() => {
                  setShowLatin((visible) => !visible);
                  setStatus(showLatin ? "Tulisan latin disembunyikan." : "Tulisan latin ditampilkan.");
                }} />
                <VisibilityButton label="Arti" visible={showMeaning} onToggle={() => {
                  setShowMeaning((visible) => !visible);
                  setStatus(showMeaning ? "Arti disembunyikan." : "Arti ditampilkan.");
                }} />
              </div>
            </div>
            <p role="status" aria-live="polite" className="sr-only">{status}</p>
          </aside>
        </>
      ) : null}

      <details className="rounded-2xl border border-outline bg-surface px-4 py-3 shadow-sm">
        <summary className="min-h-11 cursor-pointer content-center font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Daftar bacaan</summary>
        <ol className="grid gap-x-6 gap-y-2 border-t border-outline pt-3 text-sm text-muted sm:grid-cols-2">
          {readings.map((reading, index) => (
            <li key={`${reading.title}-${index}`}><a className="inline-flex min-h-10 items-center underline-offset-4 hover:text-primary hover:underline" href={`#bacaan-${index + 1}`}>{String(index + 1).padStart(2, "0")}. {reading.title}</a></li>
          ))}
          <li><a className="inline-flex min-h-10 items-center underline-offset-4 hover:text-primary hover:underline" href="#doa-setelah-tahlil">Doa setelah tahlil</a></li>
        </ol>
      </details>

      <section aria-label="Bacaan Tahlil" className="space-y-3">
        {readings.map((reading, index) => <ReadingCard key={`${reading.title}-${index}`} reading={reading} index={String(index + 1).padStart(2, "0")} id={`bacaan-${index + 1}`} sizes={sizes} showLatin={showLatin} showMeaning={showMeaning} />)}
      </section>

      <section id="doa-setelah-tahlil" aria-labelledby="tahlil-prayer-title" className="scroll-mt-24 space-y-3 pt-2">
        <div className="px-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Penutup</p>
          <h2 id="tahlil-prayer-title" className="mt-1 text-2xl font-bold text-foreground">Doa setelah tahlil</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Doa memohon ampun dan rahmat bagi kaum muslimin serta kebaikan dunia dan akhirat.</p>
        </div>
        {prayers.map((prayer, index) => <ReadingCard key={prayer.title} reading={prayer} index={`D${index + 1}`} sizes={sizes} showLatin={showLatin} showMeaning={showMeaning} />)}
      </section>
    </div>
  );
}
