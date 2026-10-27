import Link from "next/link";

export default function MockWorkspacePage() {
  return (
    <main className="min-h-screen bg-surface px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-[24px] border border-outline/60 bg-white p-8 shadow-[0_12px_30px_rgba(71,98,108,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
          Demo Workspace
        </p>
        <h1 className="mt-3 text-3xl font-bold text-primary">Limited Access Mode</h1>
        <p className="mt-3 text-base text-muted">
          Your account is signed in, but not included in the approved allowlist. For security,
          real checklist data is hidden and only this mock view is accessible.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <article className="rounded-[16px] border border-outline/60 bg-surface-soft p-4">
            <p className="text-sm text-muted">Daily Checklist</p>
            <p className="mt-1 text-lg font-semibold text-foreground">Mock Data</p>
          </article>
          <article className="rounded-[16px] border border-outline/60 bg-surface-soft p-4">
            <p className="text-sm text-muted">Templates</p>
            <p className="mt-1 text-lg font-semibold text-foreground">Hidden</p>
          </article>
          <article className="rounded-[16px] border border-outline/60 bg-surface-soft p-4">
            <p className="text-sm text-muted">Reports</p>
            <p className="mt-1 text-lg font-semibold text-foreground">Preview Only</p>
          </article>
        </div>

        <div className="mt-7">
          <Link
            href="/sign-in"
            className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
