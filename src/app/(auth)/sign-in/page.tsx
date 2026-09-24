import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { BookOpenText, ShieldCheck, Sparkles } from "lucide-react";
import { authOptions } from "@/auth";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

type SignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getErrorMessage(error: string | undefined) {
  if (error === "AccessDenied") {
    return "Access denied. Only najwanoctavian@gmail.com is authorized to enter this workspace.";
  }

  if (error === "MissingEmail") {
    return "Your Google account did not return a valid email address.";
  }

  return null;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getServerSession(authOptions);

  if (session?.user?.email?.toLowerCase() === "najwanoctavian@gmail.com") {
    redirect("/dashboard");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const error =
    typeof resolvedSearchParams.error === "string"
      ? resolvedSearchParams.error
      : undefined;
  const errorMessage = getErrorMessage(error);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 pb-24 pt-20 md:hidden">
        <div className="w-full max-w-md">
          <header className="mb-8 flex flex-col items-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-[20px] bg-white shadow-[0px_4px_12px_rgba(137,168,178,0.08)]">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-foreground">
              Welcome Back
            </h1>
            <p className="mt-2 text-base text-muted">
              Continue into your daily operations workspace.
            </p>
          </header>

          <section className="rounded-[24px] bg-white p-6 shadow-[0px_4px_12px_rgba(137,168,178,0.08)]">
            <GoogleSignInButton
              label="Continue with Google"
              className="rounded-[14px] border-outline/80 py-4 text-[12px] font-semibold uppercase tracking-[0.04em]"
            />

            <div className="my-5 flex items-center">
              <div className="h-px flex-1 bg-outline/30" />
              <span className="px-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">
                SSO Only
              </span>
              <div className="h-px flex-1 bg-outline/30" />
            </div>

            {errorMessage ? (
              <div className="mt-5 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}
          </section>
        </div>
      </main>

      <main className="hidden min-h-screen items-center justify-center bg-[#f1f0e8] bg-[radial-gradient(circle_at_top_left,rgba(137,168,178,0.15),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(179,200,207,0.2),transparent_24%)] px-4 py-10 md:flex">
        <div className="flex w-full max-w-[440px] flex-col items-center">
          <div className="mb-8 text-center">
            <div className="mb-1 flex items-center justify-center gap-2">
              <BookOpenText className="h-8 w-8 text-primary" />
              <span className="text-2xl font-extrabold tracking-tight text-primary">
                SereneDiary
              </span>
            </div>
            <p className="text-base text-muted">Stay mindful today</p>
          </div>

          <section className="w-full rounded-[20px] border border-outline/40 bg-white p-8 shadow-[0px_4px_12px_rgba(137,168,178,0.08)]">
            <header className="mb-8">
              <h1 className="text-[20px] font-semibold text-foreground">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-muted">
                Continue into your structured daily checklist workspace.
              </p>
            </header>

            <div className="space-y-6">
              <GoogleSignInButton className="rounded-[12px] border-outline/80 py-4 text-base font-medium" />

              <div className="relative flex items-center justify-center">
                <div className="h-px w-full bg-outline/40" />
                <span className="absolute bg-white px-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Secure Access
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-sm leading-7 text-muted">
                  Sign in securely with your Google account to continue.
                </p>
              </div>

              {errorMessage ? (
                <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}
            </div>
          </section>

          <div className="mt-8 flex flex-col items-center gap-4 opacity-70">
            <div className="flex gap-6 text-primary-soft">
              <Sparkles className="h-5 w-5" />
              <ShieldCheck className="h-5 w-5" />
              <BookOpenText className="h-5 w-5" />
            </div>
            <div className="relative h-48 w-64 overflow-hidden rounded-[18px] bg-surface-soft">
              <Image
                alt="Mindful nature visual"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAw-7xrS00HQwoCkDOiXxwi7MkNbqv2FI7gs-d6LsmjQWB0tcIAcj6LZaQKptMfUPBOmygBe57gfItIOWWMLG1NVBTQtJyC4II-TyeAbmZ_ymnXOSUibnBEm6EgXjnAGepZeggOReGTvnQrG8ynTnK5aFHKvZf3dswnm3drtFTONMUQFKWqbIrPRqrXpN_V9F9EQhRfVb8PvRkbB5Akb-haypgicQskuAxmxo4QDA01WOx2KPCfLIYUEcN_N11CGRTi73c3gZThkHfn"
                fill
                sizes="256px"
                className="object-cover opacity-45 grayscale"
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
