import { getTemplateLibrary } from "@/lib/template-library";
import { TemplateManager } from "@/components/template-manager";
import { getAuthorizedUserId } from "@/lib/authorized-user";

export default async function TemplatesPage() {
  const userId = await getAuthorizedUserId();
  const templates = await getTemplateLibrary(userId ?? undefined);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-[32px] font-bold tracking-[-0.02em] text-foreground">
          Template Management
        </h2>
        <p className="mt-2 text-base text-muted">
          Personalize your daily structure with reusable checklist templates.
        </p>
      </header>
      <TemplateManager initialTemplates={templates} />
    </div>
  );
}
