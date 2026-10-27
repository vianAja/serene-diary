"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

export type TahlilReading = {
  title: string;
  note: string;
  repetition: string;
  arabic: string;
  latin: string;
  meaning: string;
};

function TextSizeButton({
  label,
  size,
  max,
  onIncrease,
}: {
  label: string;
  size: number;
  max: number;
  onIncrease: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onIncrease}
      disabled={size >= max}
      aria-label={`Perbesar tulisan ${label}`}
      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[#526170] bg-[#26323d] px-3 text-sm font-semibold text-[#f0f4f7] transition-colors hover:bg-[#344351] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6d5e8] disabled:cursor-not-allowed disabled:opacity-45"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      {label}
      <span className="sr-only">, ukuran sekarang {size} piksel</span>
    </button>
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
      aria-pressed={visible}
      aria-label={`${visible ? "Sembunyikan" : "Tampilkan"} ${label}`}
      className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#526170] bg-transparent px-3 text-sm font-semibold text-[#dbe4ea] transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6d5e8]"
    >
      {visible ? "Sembunyikan" : "Tampilkan"} {label}
    </button>
  );
}

function ReadingCard({
  reading,
  index,
  id,
  arabicSize,
  latinSize,
  meaningSize,
  showLatin,
  showMeaning,
}: {
  reading: TahlilReading;
  index: string;
  id?: string;
  arabicSize: number;
  latinSize: number;
  meaningSize: number;
  showLatin: boolean;
  showMeaning: boolean;
}) {
  return (
    <article id={id} className="scroll-mt-24 rounded-[10px] border border-[#303b46] bg-[#1d252d] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="inline-flex min-h-8 items-center rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-[#d7e0e6]">
            {reading.note || index}
          </span>
          <h2 className="text-sm font-semibold text-[#e6edf1]">{reading.title}</h2>
        </div>
        <span
          aria-label={`Bacaan ini dibaca ${reading.repetition}`}
          className="inline-flex min-h-8 shrink-0 items-center rounded-full bg-[#31404b] px-3 text-xs font-bold text-[#f2f6f8]"
        >
          {reading.repetition}
        </span>
      </div>

      <p
        lang="ar"
        dir="rtl"
        className="tahlil-arabic mt-7 break-words text-right text-[#f0f4f6]"
        style={{ fontSize: `${arabicSize}px`, lineHeight: 1.95 }}
      >
        {reading.arabic}
      </p>

      {showLatin ? (
        <p
          lang="id-Latn"
          className="mt-6 whitespace-pre-line break-words text-[#dce5eb]"
          style={{ fontSize: `${latinSize}px`, lineHeight: 1.75 }}
        >
          {reading.latin}
        </p>
      ) : null}

      {showMeaning ? (
        <p
          lang="id"
          className={`${showLatin ? "mt-4" : "mt-6"} whitespace-pre-line break-words text-[#dce5eb]`}
          style={{ fontSize: `${meaningSize}px`, lineHeight: 1.75 }}
        >
          {reading.meaning}
        </p>
      ) : null}
    </article>
  );
}

function enlarge(setSize: (update: (current: number) => number) => void, max: number, step: number) {
  setSize((current) => Math.min(current + step, max));
}

export function TahlilReader({
  readings,
  prayers,
}: {
  readings: TahlilReading[];
  prayers: TahlilReading[];
}) {
  const [arabicSize, setArabicSize] = useState(34);
  const [latinSize, setLatinSize] = useState(17);
  const [meaningSize, setMeaningSize] = useState(17);
  const [showLatin, setShowLatin] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [status, setStatus] = useState("");

  return (
    <div className="space-y-5">
      <section
        aria-label="Pengaturan tampilan bacaan"
        className="rounded-[10px] border border-[#35424e] bg-[#222b34] p-4 md:p-5"
      >
        <p className="text-sm font-semibold text-[#eef3f6]">Pengaturan teks</p>
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Perbesar ukuran teks">
          <TextSizeButton
            label="Arab +"
            size={arabicSize}
            max={58}
            onIncrease={() => {
              enlarge(setArabicSize, 58, 4);
              setStatus("Ukuran tulisan Arab diperbesar.");
            }}
          />
          <TextSizeButton
            label="Latin +"
            size={latinSize}
            max={27}
            onIncrease={() => {
              enlarge(setLatinSize, 27, 2);
              setStatus("Ukuran tulisan latin diperbesar.");
            }}
          />
          <TextSizeButton
            label="Arti +"
            size={meaningSize}
            max={27}
            onIncrease={() => {
              enlarge(setMeaningSize, 27, 2);
              setStatus("Ukuran arti diperbesar.");
            }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <VisibilityButton
            label="latin"
            visible={showLatin}
            onToggle={() => {
              setShowLatin((current) => !current);
              setStatus(showLatin ? "Tulisan latin disembunyikan." : "Tulisan latin ditampilkan.");
            }}
          />
          <VisibilityButton
            label="arti"
            visible={showMeaning}
            onToggle={() => {
              setShowMeaning((current) => !current);
              setStatus(showMeaning ? "Arti disembunyikan." : "Arti ditampilkan.");
            }}
          />
        </div>
        <p role="status" aria-live="polite" className="sr-only">{status}</p>
      </section>

      <details className="rounded-[10px] border border-[#35424e] bg-[#202a33] px-4 py-3">
        <summary className="min-h-11 cursor-pointer content-center font-semibold text-[#eef3f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6d5e8]">
          Daftar bacaan
        </summary>
        <ol className="grid gap-x-6 gap-y-2 border-t border-[#394752] pt-3 text-sm text-[#d0dbe2] sm:grid-cols-2">
          {readings.map((reading, index) => (
            <li key={`${reading.title}-${index}`}>
              <a className="inline-flex min-h-10 items-center underline-offset-4 hover:text-white hover:underline" href={`#bacaan-${index + 1}`}>
                {String(index + 1).padStart(2, "0")}. {reading.title}
              </a>
            </li>
          ))}
          <li>
            <a className="inline-flex min-h-10 items-center underline-offset-4 hover:text-white hover:underline" href="#doa-setelah-tahlil">
              Doa setelah tahlil
            </a>
          </li>
        </ol>
      </details>

      <section aria-label="Bacaan Tahlil" className="space-y-3">
        {readings.map((reading, index) => (
          <ReadingCard
            key={`${reading.title}-${index}`}
            reading={reading}
            index={String(index + 1).padStart(2, "0")}
            id={`bacaan-${index + 1}`}
            arabicSize={arabicSize}
            latinSize={latinSize}
            meaningSize={meaningSize}
            showLatin={showLatin}
            showMeaning={showMeaning}
          />
        ))}
      </section>

      <section id="doa-setelah-tahlil" aria-labelledby="tahlil-prayer-title" className="scroll-mt-24 space-y-3 pt-2">
        <div className="px-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#aebdc8]">
            Penutup
          </p>
          <h2 id="tahlil-prayer-title" className="mt-1 text-2xl font-bold text-[#f0f4f6]">
            Doa setelah tahlil
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c8d3db]">
            Doa memohon ampun dan rahmat bagi kaum muslimin serta kebaikan dunia dan akhirat.
          </p>
        </div>
        {prayers.map((prayer, index) => (
          <ReadingCard
            key={prayer.title}
            reading={prayer}
            index={`D${index + 1}`}
            arabicSize={arabicSize}
            latinSize={latinSize}
            meaningSize={meaningSize}
            showLatin={showLatin}
            showMeaning={showMeaning}
          />
        ))}
      </section>
    </div>
  );
}
