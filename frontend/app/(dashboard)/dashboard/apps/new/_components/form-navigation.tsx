"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS } from "../_lib/schema";

interface FormNavigationProps {
  currentStep: number;
  goToPrev: () => void;
  goToNext: () => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export function FormNavigation({
  currentStep,
  goToPrev,
  goToNext,
  isLoading,
  onSubmit,
}: FormNavigationProps) {
  const isLastStep = currentStep === STEPS.length;

  return (
    <div className="flex items-center justify-between pt-10 mt-10 border-t border-gray-100">
      <Button
        type="button"
        variant="ghost"
        onClick={goToPrev}
        disabled={currentStep === 1 || isLoading}
        className={cn(
          "h-14 px-8 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 transition-all",
          currentStep === 1 && "opacity-0 pointer-events-none"
        )}
      >
        <ArrowLeft className="mr-3 h-5 w-5" />
        Back
      </Button>

      <div className="flex items-center gap-2">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              s.id === currentStep 
                ? "w-8 bg-main-green shadow-sm shadow-green-100" 
                : s.id < currentStep 
                  ? "w-4 bg-main-green/30" 
                  : "w-2 bg-gray-200"
            )}
          />
        ))}
      </div>

      {!isLastStep ? (
        <Button
          type="button"
          onClick={goToNext}
          disabled={isLoading}
          className="h-14 px-10 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] active:scale-95"
        >
          Continue
          <ArrowRight className="ml-3 h-5 w-5" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="h-14 px-12 rounded-2xl bg-main-green hover:bg-main-green/90 text-white font-black shadow-xl shadow-green-200 transition-all hover:scale-[1.02] active:scale-95"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Launching...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-3 h-5 w-5" />
              Launch App
            </>
          )}
        </Button>
      )}
    </div>
  );
}
