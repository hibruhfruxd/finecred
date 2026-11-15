import type { Metadata } from "next";
import { OnboardingFlow } from "@/frontend/components/finance/AuthForms";

export const metadata: Metadata = { title: "Demo onboarding" };

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
