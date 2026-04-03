import { redirect } from "react-router";

export const loader = () => redirect("/app/onboarding/welcome");

export default function OnboardingIndex() {
  return null;
}


