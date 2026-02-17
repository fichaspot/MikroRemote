import { useWizardStore, WIZARD_STEPS } from "@/stores/wizard-store";
import { StepTracker } from "@/components/ui/StepTracker";
import { Step1Start } from "./steps/Step1Start";
import { Step2Server } from "./steps/Step2Server";
import { Step3Network } from "./steps/Step3Network";
import { Step4Clients } from "./steps/Step4Clients";
import { Step5ServerKeys } from "./steps/Step5ServerKeys";
import { Step6Summary } from "./steps/Step6Summary";
import { Step7Results } from "./steps/Step7Results";

const stepComponents = [
  Step1Start,
  Step2Server,
  Step3Network,
  Step4Clients,
  Step5ServerKeys,
  Step6Summary,
  Step7Results,
];

export function WgWizard() {
  const { currentStep } = useWizardStore();

  const StepComponent = stepComponents[currentStep] || stepComponents[0];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <StepTracker
        steps={WIZARD_STEPS as unknown as string[]}
        currentStep={currentStep}
      />
      <div className="flex-1 py-6 overflow-y-auto">
        <StepComponent />
      </div>
    </div>
  );
}
