"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Mail, ShieldCheck, UserRound } from "lucide-react";

type ViewerProfile = {
  name: string;
  email: string;
  initials: string;
  authLabel: string;
  authDescription: string;
  avatarUrl: string | null;
  signedIn: boolean;
};

export function ProfileMenu({ profile }: { profile: ViewerProfile }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-0 rounded-full border border-transparent bg-transparent px-0 py-0 shadow-none hover:bg-transparent md:gap-2 md:border md:border-outline/70 md:bg-white md:px-2 md:py-1.5 md:shadow-sm md:hover:bg-surface-soft"
      >
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={profile.name}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {profile.initials}
          </span>
        )}
        <ChevronDown className="hidden h-4 w-4 text-muted md:block" />
      </button>

      {open ? (
        <div className="absolute left-0 top-12 z-50 w-[min(18rem,calc(100vw-2rem))] rounded-[18px] border border-outline/70 bg-white p-4 shadow-[0_12px_32px_rgba(71,98,108,0.14)] md:left-auto md:right-0 md:top-14 md:w-72">
          <div className="flex items-center gap-3">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {profile.initials}
              </span>
            )}
            <div>
              <p className="font-semibold text-foreground">{profile.name}</p>
              <p className="text-sm text-muted">{profile.email}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 rounded-[14px] bg-surface-soft p-3">
            <div className="flex items-start gap-3">
              <UserRound className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Status User
                </p>
                <p className="text-sm text-foreground">
                  {profile.signedIn ? "Sudah login" : "Belum login"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Email
                </p>
                <p className="text-sm text-foreground">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Metode Auth
                </p>
                <p className="text-sm font-medium text-foreground">
                  {profile.authLabel}
                </p>
                <p className="text-sm text-muted">{profile.authDescription}</p>
              </div>
            </div>
          </div>

          {!profile.signedIn ? (
            <Link
              href="/sign-in"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Buka Login
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
