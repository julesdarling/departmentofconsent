import { DEFAULT_AFTERCARE_ITEMS } from "@/lib/storage";
import { Checklist } from "@/components/Checklist";

export function AftercareChecklist(props: {
  selected: string[];
  onChange: (next: string[]) => void;
  extraItems?: string[];
}) {
  return (
    <Checklist
      defaultItems={DEFAULT_AFTERCARE_ITEMS}
      addPlaceholder="Add another aftercare item…"
      {...props}
    />
  );
}
