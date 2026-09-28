import { CONFIDENCE, SCENARIOS, STATUS_BY_ID } from "./scenarios.js";

const CONFIDENCE_PRIORITY = {
  confirmed: 3,
  inferred: 2,
  suspected: 1,
};

export function deriveVerdict(signals) {
  const orderedSignals = [...signals].sort((left, right) => {
    const statusDifference =
      STATUS_BY_ID[right.statusId].priority - STATUS_BY_ID[left.statusId].priority;
    if (statusDifference !== 0) return statusDifference;
    return CONFIDENCE_PRIORITY[right.confidence] - CONFIDENCE_PRIORITY[left.confidence];
  });

  const primarySignal = orderedSignals[0] ?? null;
  const status = primarySignal
    ? STATUS_BY_ID[primarySignal.statusId]
    : STATUS_BY_ID.safe;

  return {
    status,
    confidence: primarySignal ? CONFIDENCE[primarySignal.confidence] : null,
    primarySignal,
    signals: orderedSignals,
  };
}

export function signalsForScenario(statusId) {
  return SCENARIOS[statusId] ?? [];
}
