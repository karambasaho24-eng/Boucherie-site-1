import { getSettings } from "@/lib/data";
import CustomizationForm from "./CustomizationForm";

export const dynamic = "force-dynamic";

export default function PersonnalisationPage() {
  const settings = getSettings();
  return <CustomizationForm initial={settings} />;
}
