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
  loadLocalSnapshot: document.querySelector("#loadLocalSnapshot"),
  localSnapshotInput: document.querySelector("#localSnapshotInput"),
  localDataPanel: document.querySelector("#localDataPanel"),
  localDataStatus: document.querySelector("#localDataStatus"),
  localDataEmpty: document.querySelector("#localDataEmpty"),
  localDataResults: document.querySelector("#localDataResults"),
  localDataError: document.querySelector("#localDataError"),
  clearLocalData: document.querySelector("#clearLocalData"),
  localWindowValue: document.querySelector("#localWindowValue"),
  localSignInValue: document.querySelector("#localSignInValue"),
  localFailureValue: document.querySelector("#localFailureValue"),
  localSessionValue: document.querySelector("#localSessionValue"),
  localSignInCount: document.querySelector("#localSignInCount"),
  localSessionCount: document.querySelector("#localSessionCount"),
  localSignInList: document.querySelector("#localSignInList"),
  localSessionList: document.querySelector("#localSessionList"),
  localImportedAt: document.querySelector("#localImportedAt"),
};

let activeScenario = "safe";
let scenarioButtons = new Map();
let hasLocalSnapshot = false;

const REMOTE_LOGON_TYPES = new Set(["3", "10", "12"]);
const LOGON_TYPE_LABELS = {
  "3": "Network logon",
  "10": "Remote interactive logon",
  "12": "Cached remote interactive logon",
};

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

function formatSnapshotTime(value) {
  if (!value) return "Time not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function createLocalEvidenceRow({ titleText, detailText, timeText, addressLabel, addressText }) {
  const row = document.createElement("article");
  row.className = "local-evidence-row";

  const title = document.createElement("div");
  title.className = "local-evidence-title";
  const titleCopy = document.createElement("span");
  titleCopy.textContent = titleText;
  title.append(titleCopy);
  if (timeText) {
    const time = document.createElement("time");
    time.textContent = timeText;
    title.append(time);
  }

  const details = document.createElement("p");
  details.className = "local-evidence-detail";
  details.textContent = detailText;
  row.append(title, details);

  if (addressText) {
    const address = document.createElement("div");
    address.className = "local-evidence-address";
    const label = document.createElement("span");
    label.textContent = addressLabel;
    const value = document.createElement("code");
    value.textContent = addressText;
    address.append(label, value);
    row.append(address);
  }

  return row;
}

function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    throw new Error("The file must contain a WinSentinel snapshot object.");
  }
  if (snapshot.schemaVersion !== "1.0") {
    throw new Error("This snapshot schema version is not supported.");
  }
  if (!Number.isInteger(snapshot.sinceHours) || snapshot.sinceHours < 1 || snapshot.sinceHours > 720) {
    throw new Error("The snapshot must include a collection window from 1 to 720 hours.");
  }
  if (!Array.isArray(snapshot.signInEvents) || !Array.isArray(snapshot.remoteSessions)) {
    throw new Error("The snapshot is missing its sign-in event or RDP session array.");
  }
  if (snapshot.signInEvents.some((event) =>
    !event || typeof event !== "object" || event.schemaVersion !== "1.0" ||
    ![4624, 4625].includes(event.eventId) || !["success", "failure"].includes(event.result)
  )) {
    throw new Error("The snapshot contains an invalid sign-in event record.");
  }
  if (snapshot.remoteSessions.some((session) =>
    !session || typeof session !== "object" || session.schemaVersion !== "1.0" ||
    !Number.isInteger(session.sessionId) || !["Active", "Connected", "Disconnected"].includes(session.state)
  )) {
    throw new Error("The snapshot contains an invalid RDP session record.");
  }
  return snapshot;
}

function renderLocalSnapshot(snapshot) {
  const remoteEvents = snapshot.signInEvents
    .filter((event) => REMOTE_LOGON_TYPES.has(String(event.logonType)))
    .sort((left, right) => new Date(right.timeUtc).getTime() - new Date(left.timeUtc).getTime());
  const failedEvents = remoteEvents.filter((event) => event.result === "failure");

  elements.localWindowValue.textContent = `Last ${snapshot.sinceHours} hours`;
  elements.localSignInValue.textContent = String(remoteEvents.length);
  elements.localFailureValue.textContent = String(failedEvents.length);
  elements.localSessionValue.textContent = String(snapshot.remoteSessions.length);
  elements.localSignInCount.textContent = `${remoteEvents.length} ${remoteEvents.length === 1 ? "EVENT" : "EVENTS"}`;
  elements.localSessionCount.textContent = `${snapshot.remoteSessions.length} ${snapshot.remoteSessions.length === 1 ? "SESSION" : "SESSIONS"}`;
  elements.localSignInList.replaceChildren();
  elements.localSessionList.replaceChildren();

  if (remoteEvents.length === 0) {
    const empty = document.createElement("p");
    empty.className = "local-data-empty";
    empty.textContent = "No matching network or remote logon events were returned for this window.";
    elements.localSignInList.append(empty);
  } else {
    remoteEvents.slice(0, 100).forEach((event) => {
      const account = [event.accountDomain, event.accountName].filter(Boolean).join("\\");
      const details = [
        LOGON_TYPE_LABELS[String(event.logonType)] ?? `Logon type ${event.logonType ?? "unknown"}`,
        `Windows event ${event.eventId}`,
        account ? `Account ${account}` : null,
      ].filter(Boolean).join(" · ");
      elements.localSignInList.append(createLocalEvidenceRow({
        titleText: event.result === "success" ? "Successful sign-in event" : "Failed sign-in event",
        detailText: details,
        timeText: formatSnapshotTime(event.timeUtc),
        addressLabel: "Source address reported by Windows:",
        addressText: event.sourceAddress || "Not recorded",
      }));
    });
    if (remoteEvents.length > 100) {
      const more = document.createElement("p");
      more.className = "local-data-note";
      more.textContent = `Showing the 100 most recent of ${remoteEvents.length} matching events.`;
      elements.localSignInList.append(more);
    }
  }

  if (snapshot.remoteSessions.length === 0) {
    const empty = document.createElement("p");
    empty.className = "local-data-empty";
    empty.textContent = "No RDP sessions were returned by this query.";
    elements.localSessionList.append(empty);
  } else {
    snapshot.remoteSessions.forEach((session) => {
      const account = [session.domainName, session.userName].filter(Boolean).join("\\");
      const details = [
        `Session ID ${session.sessionId}`,
        account ? `Account ${account}` : null,
        session.sessionName ? `Session ${session.sessionName}` : null,
      ].filter(Boolean).join(" · ");
      elements.localSessionList.append(createLocalEvidenceRow({
        titleText: `RDP session · ${session.state}`,
        detailText: details,
        addressLabel: "Address reported by the RDP client:",
        addressText: session.clientReportedAddress || "Not available",
      }));
    });
  }

  elements.localImportedAt.textContent =
    `Snapshot collected ${formatSnapshotTime(snapshot.collectedAtUtc)} · ${snapshot.signInEvents.length} total sign-in events queried.`;
  elements.localDataEmpty.hidden = true;
  elements.localDataResults.hidden = false;
  elements.localDataStatus.textContent = "SNAPSHOT LOADED · IN THIS TAB";
  elements.localDataError.hidden = true;
  elements.clearLocalData.disabled = false;
  hasLocalSnapshot = true;
}

function clearLocalSnapshot() {
  elements.localSnapshotInput.value = "";
  elements.localSignInList.replaceChildren();
  elements.localSessionList.replaceChildren();
  elements.localWindowValue.textContent = "—";
  elements.localSignInValue.textContent = "—";
  elements.localFailureValue.textContent = "—";
  elements.localSessionValue.textContent = "—";
  elements.localSignInCount.textContent = "0 EVENTS";
  elements.localSessionCount.textContent = "0 SESSIONS";
  elements.localImportedAt.textContent = "";
  elements.localDataResults.hidden = true;
  elements.localDataEmpty.hidden = false;
  elements.localDataError.hidden = true;
  elements.localDataStatus.textContent = "NO SNAPSHOT LOADED";
  elements.clearLocalData.disabled = true;
  hasLocalSnapshot = false;
}

async function importLocalSnapshot(file) {
  elements.localDataError.hidden = true;
  try {
    if (file.size > 20 * 1024 * 1024) {
      throw new Error("The snapshot file is larger than 20 MB.");
    }
    const snapshot = validateSnapshot(JSON.parse(await file.text()));
    renderLocalSnapshot(snapshot);
  } catch (error) {
    elements.localDataError.textContent = error instanceof Error
      ? error.message
      : "The selected file could not be read as a WinSentinel snapshot.";
    elements.localDataError.hidden = false;
    if (hasLocalSnapshot) {
      elements.localDataStatus.textContent = "IMPORT FAILED · PREVIOUS SNAPSHOT RETAINED";
    }
  } finally {
    elements.localSnapshotInput.value = "";
  }
}

function setupLocalSnapshotImport() {
  const localViewer = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
  if (!localViewer) return;

  elements.localDataPanel.hidden = false;
  elements.loadLocalSnapshot.hidden = false;
  elements.loadLocalSnapshot.addEventListener("click", () => elements.localSnapshotInput.click());
  elements.localSnapshotInput.addEventListener("change", () => {
    const file = elements.localSnapshotInput.files?.[0];
    if (file) importLocalSnapshot(file);
  });
  elements.clearLocalData.addEventListener("click", clearLocalSnapshot);
}

createScenarioControls();
setupLocalSnapshotImport();
elements.nextScenario.addEventListener("click", moveToNextScenario);
elements.resetDemo.addEventListener("click", () => selectScenario("safe"));
selectScenario("safe");
