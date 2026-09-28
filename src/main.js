import "./styles.css";
import { CONFIDENCE, STATUS, STATUS_BY_ID } from "./scenarios.js";
import { deriveVerdict, signalsForScenario } from "./verdict.js";
import { createSecurityScene } from "./scene.js";

const elements = {
  scenarioList: document.querySelector("#scenarioList"),
  verdictCard: document.querySelector("#verdictCard"),
  verdictIcon: document.querySelector("#verdictIcon"),
  verdictTitle: document.querySelector("#verdictTitle"),
  verdictDescription: document.querySelector("#verdictDescription"),
  verdictConfidence: document.querySelector("#verdictConfidence"),
  eventFeed: document.querySelector("#eventFeed"),
  eventCount: document.querySelector("#eventCount"),
  nextScenario: document.querySelector("#nextScenario"),
  resetDemo: document.querySelector("#resetDemo"),
  sceneViewport: document.querySelector("#sceneViewport"),
  sceneCanvas: document.querySelector("#sentinelScene"),
  sceneFallback: document.querySelector("#sceneFallback"),
  sceneModeLabel: document.querySelector("#sceneModeLabel"),
  sceneDirectionLabel: document.querySelector("#sceneDirectionLabel"),
  guidanceState: document.querySelector("#guidanceState"),
  guidanceList: document.querySelector("#guidanceList"),
};

let activeScenario = "safe";
let scenarioButtons = new Map();

const scene = createSecurityScene(elements.sceneCanvas, elements.sceneViewport, () => {
  elements.sceneFallback.hidden = false;
});

function createScenarioControls() {
  const fragment = document.createDocumentFragment();

  STATUS.forEach((status, index) => {
    const button = document.createElement("button");
    button.className = "scenario-button";
    button.type = "button";
    button.dataset.scenario = status.id;
    button.setAttribute("aria-pressed", "false");
    button.style.setProperty("--scenario-color", status.color);

    const dot = document.createElement("span");
    dot.className = "scenario-dot";
    dot.setAttribute("aria-hidden", "true");

    const copy = document.createElement("span");
    copy.className = "scenario-copy";
    const label = document.createElement("strong");
    label.textContent = status.label;
    const hint = document.createElement("small");
    hint.textContent = status.short;
    copy.append(label, hint);

    const key = document.createElement("span");
    key.className = "scenario-index";
    key.textContent = String(index + 1).padStart(2, "0");

    button.append(dot, copy, key);
    button.addEventListener("click", () => selectScenario(status.id));
    fragment.append(button);
    scenarioButtons.set(status.id, button);
  });

  elements.scenarioList.append(fragment);
}

function renderSignals(signals) {
  elements.eventCount.textContent =
    signals.length + (signals.length === 1 ? " SIGNAL" : " SIGNALS");
  elements.eventFeed.replaceChildren();

  if (signals.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-feed";
    empty.innerHTML =
      '<span class="empty-feed-check" aria-hidden="true">✓</span>' +
      "<span><strong>No active demo signals</strong><small>Choose a scenario to preview how the feed changes.</small></span>";
    elements.eventFeed.append(empty);
    return;
  }

  signals.forEach((signal) => {
    const status = STATUS_BY_ID[signal.statusId];
    const confidence = CONFIDENCE[signal.confidence];
    const card = document.createElement("article");
    card.className = "event-item";
    card.style.setProperty("--signal-color", status.color);

    const marker = document.createElement("span");
    marker.className = "event-marker";
    marker.setAttribute("aria-hidden", "true");

    const copy = document.createElement("div");
    copy.className = "event-main";
    const titleRow = document.createElement("div");
    titleRow.className = "event-title-row";
    const title = document.createElement("strong");
    title.textContent = signal.title;
    const confidenceBadge = document.createElement("span");
    confidenceBadge.className = "confidence-badge event-confidence";
    confidenceBadge.dataset.confidence = signal.confidence;
    confidenceBadge.textContent = confidence.label.toUpperCase();
    titleRow.append(title, confidenceBadge);
    const detail = document.createElement("p");
    detail.textContent = signal.detail;
    detail.className = "event-detail";
    copy.append(titleRow, detail);

    const meta = document.createElement("div");
    meta.className = "event-meta";
    const source = document.createElement("span");
    source.className = "event-source";
    source.textContent = signal.source;
    const time = document.createElement("span");
    time.className = "event-time";
    time.textContent = "NOW";
    meta.append(source, time);
    copy.append(meta);

    if (signal.networkFootprint) {
      const footprint = document.createElement("div");
      footprint.className = "event-footprint";
      const footprintLabel = document.createElement("span");
      footprintLabel.className = "footprint-label";
      footprintLabel.textContent = signal.networkFootprint.label;
      const address = document.createElement("code");
      address.textContent = signal.networkFootprint.address;
      const note = document.createElement("span");
      note.className = "footprint-note";
      note.textContent = signal.networkFootprint.note;
      footprint.append(footprintLabel, address, note);
      copy.append(footprint);
    }

    card.append(marker, copy);
    elements.eventFeed.append(card);
  });
}

function renderGuidance(status) {
  elements.guidanceState.textContent = status.label.toUpperCase();
  elements.guidanceList.replaceChildren();
  status.recommendations.forEach((recommendation) => {
    const item = document.createElement("li");
    item.textContent = recommendation;
    elements.guidanceList.append(item);
  });
}

function selectScenario(statusId) {
  activeScenario = statusId;
  const signals = signalsForScenario(statusId);
  const verdict = deriveVerdict(signals);
  const status = verdict.status;

  document.documentElement.style.setProperty("--status-color", status.color);
  elements.verdictCard.dataset.status = status.id;
  elements.verdictIcon.textContent = status.icon;
  elements.verdictTitle.textContent = status.label;
  elements.verdictDescription.textContent = status.description;

  if (verdict.confidence) {
    elements.verdictConfidence.textContent = verdict.confidence.label.toUpperCase();
    elements.verdictConfidence.dataset.confidence =
      verdict.primarySignal.confidence;
    elements.verdictConfidence.title = verdict.confidence.description;
  } else {
    elements.verdictConfidence.textContent = "NO ACTIVE SIGNALS";
    elements.verdictConfidence.dataset.confidence = "confirmed";
    elements.verdictConfidence.title = "No example signals are active.";
  }

  scenarioButtons.forEach((button, id) => {
    button.setAttribute("aria-pressed", String(id === statusId));
  });
  elements.sceneViewport.dataset.status = status.id;
  elements.sceneModeLabel.textContent = status.sceneLabel;
  elements.sceneDirectionLabel.textContent = status.sceneDirection;
  renderGuidance(status);
  renderSignals(verdict.signals);
  scene.setVerdict(status);
}

function moveToNextScenario() {
  const currentIndex = STATUS.findIndex((status) => status.id === activeScenario);
  const next = STATUS[(currentIndex + 1) % STATUS.length];
  selectScenario(next.id);
}

createScenarioControls();
elements.nextScenario.addEventListener("click", moveToNextScenario);
elements.resetDemo.addEventListener("click", () => selectScenario("safe"));
selectScenario("safe");
