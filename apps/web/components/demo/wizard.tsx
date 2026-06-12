"use client";

import { useState } from "react";
import type { TipoOficio } from "@enge-pro/shared";
import { Button } from "@/components/ui/button";
import { StepOficio } from "./step-oficio";
import { StepPrestador } from "./step-prestador";
import { StepCliente } from "./step-cliente";
import { StepServicos, getInitialServicoState, type ServicoState } from "./step-servicos";
import { StepCondicoes } from "./step-condicoes";
import { Preview } from "./preview";
import { cn } from "@/lib/utils";

type Step = "oficio" | "prestador" | "cliente" | "servicos" | "condicoes" | "preview";

const STEPS: { id: Step; label: string }[] = [
  { id: "oficio", label: "Ofício" },
  { id: "prestador", label: "Prestador" },
  { id: "cliente", label: "Cliente" },
  { id: "servicos", label: "Serviços" },
  { id: "condicoes", label: "Condições" },
  { id: "preview", label: "PDF" },
];

interface WizardState {
  oficio: TipoOficio | null;
  prestador: { nome: string; cpfCnpj: string; telefone: string };
  cliente: { nome: string; endereco: string };
  servicos: ServicoState | null;
  condicoes: { pagamento: string; validadeDias: number; observacoes: string };
}

function canAdvance(step: Step, state: WizardState): boolean {
  switch (step) {
    case "oficio":
      return state.oficio !== null;
    case "prestador":
      return state.prestador.nome.trim().length > 0;
    case "cliente":
      return state.cliente.nome.trim().length > 0;
    case "servicos": {
      if (!state.servicos) return false;
      if (state.servicos.modo === "verba") {
        return (
          state.servicos.verba.descricao.trim().length > 0 &&
          parseFloat(state.servicos.verba.valorTotal) > 0
        );
      }
      return state.servicos.itens.some((i) => i.checked && i.quantidade > 0);
    }
    case "condicoes":
      return true;
    case "preview":
      return false;
  }
}

const STEP_ORDER: Step[] = ["oficio", "prestador", "cliente", "servicos", "condicoes", "preview"];

export function DemoWizard() {
  const [currentStep, setCurrentStep] = useState<Step>("oficio");
  const [state, setState] = useState<WizardState>({
    oficio: null,
    prestador: { nome: "", cpfCnpj: "", telefone: "" },
    cliente: { nome: "", endereco: "" },
    servicos: null,
    condicoes: { pagamento: "", validadeDias: 10, observacoes: "" },
  });

  const stepIndex = STEP_ORDER.indexOf(currentStep);

  function goNext() {
    if (currentStep === "oficio" && state.oficio && !state.servicos) {
      setState((s) => ({ ...s, servicos: getInitialServicoState(state.oficio!) }));
    }
    const next = STEP_ORDER[stepIndex + 1];
    if (next) setCurrentStep(next);
  }

  function goBack() {
    const prev = STEP_ORDER[stepIndex - 1];
    if (prev) setCurrentStep(prev);
  }

  function handleOficioChange(oficio: TipoOficio) {
    setState((s) => ({
      ...s,
      oficio,
      servicos: getInitialServicoState(oficio),
    }));
  }

  const isLastStep = currentStep === "preview";
  const canGoNext = canAdvance(currentStep, state);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                i < stepIndex
                  ? "bg-primary text-primary-foreground"
                  : i === stepIndex
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i < stepIndex ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-5 rounded-full transition-colors",
                  i < stepIndex ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step label */}
      <p className="text-center text-xs text-muted-foreground mb-6 uppercase tracking-wider font-medium">
        Passo {stepIndex + 1} de {STEPS.length} — {STEPS[stepIndex].label}
      </p>

      {/* Step content */}
      <div className="min-h-[300px]">
        {currentStep === "oficio" && (
          <StepOficio value={state.oficio} onChange={handleOficioChange} />
        )}
        {currentStep === "prestador" && (
          <StepPrestador
            value={state.prestador}
            onChange={(v) => setState((s) => ({ ...s, prestador: v }))}
          />
        )}
        {currentStep === "cliente" && (
          <StepCliente
            value={state.cliente}
            onChange={(v) => setState((s) => ({ ...s, cliente: v }))}
          />
        )}
        {currentStep === "servicos" && state.oficio && state.servicos && (
          <StepServicos
            oficio={state.oficio}
            value={state.servicos}
            onChange={(v) => setState((s) => ({ ...s, servicos: v }))}
          />
        )}
        {currentStep === "condicoes" && (
          <StepCondicoes
            value={state.condicoes}
            onChange={(v) => setState((s) => ({ ...s, condicoes: v }))}
          />
        )}
        {currentStep === "preview" && state.oficio && state.servicos && (
          <Preview
            oficio={state.oficio}
            prestador={state.prestador}
            cliente={state.cliente}
            servicos={state.servicos}
            condicoes={state.condicoes}
          />
        )}
      </div>

      {/* Navigation */}
      {!isLastStep && (
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={stepIndex === 0}
          >
            Voltar
          </Button>
          <Button type="button" onClick={goNext} disabled={!canGoNext}>
            {stepIndex === STEP_ORDER.length - 2 ? "Ver resumo" : "Próximo"}
          </Button>
        </div>
      )}
      {isLastStep && (
        <div className="flex justify-start mt-8">
          <Button type="button" variant="outline" onClick={goBack}>
            Voltar e editar
          </Button>
        </div>
      )}
    </div>
  );
}
