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
    copy.className = "event-copy";
    const title = document.createElement("strong");
    title.textContent = signal.title;
    const detail = document.createElement("p");
    detail.textContent = signal.detail;
    copy.append(title, detail);

    const meta = document.createElement("div");
    meta.className = "event-meta";
    const source = document.createElement("span");
    source.className = "event-source";
    source.textContent = signal.source;
    const confidenceBadge = document.createElement("span");
    confidenceBadge.className = "confidence-badge";
    confidenceBadge.dataset.confidence = signal.confidence;
    confidenceBadge.textContent = confidence.label.toUpperCase();
    meta.append(source, confidenceBadge);

    const time = document.createElement("span");
    time.className = "event-time";
    time.textContent = "NOW";
    card.append(marker, copy, meta, time);
    elements.eventFeed.append(card);
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
