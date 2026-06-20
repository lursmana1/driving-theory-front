import { LandingHowSteps } from "./LandingHowSteps";
import { LandingStatsBand } from "./LandingStatsBand";
import { LandingSocialProof } from "./LandingSocialProof";

export default async function LandingHow() {
  return (
    <>
      <LandingHowSteps />
      <LandingStatsBand />
      <LandingSocialProof />
    </>
  );
}
