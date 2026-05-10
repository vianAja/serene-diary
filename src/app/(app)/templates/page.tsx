import { getTemplateManagementSnapshot } from "@/lib/mock-data";
import { TemplateManager } from "@/components/template-manager";

export default function TemplatesPage() {
  const snapshot = getTemplateManagementSnapshot();

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
      <TemplateManager initialTemplates={snapshot.templates} />
    </div>
  );
}
