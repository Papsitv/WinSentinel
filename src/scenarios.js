export const CONFIDENCE = {
  confirmed: {
    label: "Confirmed",
    description: "A direct event or known system state was recorded.",
  },
  inferred: {
    label: "Inferred",
    description: "Several cues combine into a likely pattern.",
  },
  suspected: {
    label: "Suspected",
    description: "A heuristic flagged behavior that needs corroboration.",
  },
};

export const STATUS = [
  {
    id: "safe",
    label: "Safe",
    short: "No active signals",
    description: "No active demo signals.",
    priority: 0,
    color: "#76e4c4",
    icon: "✓",
  },
  {
    id: "at-risk",
    label: "At risk",
    short: "System change",
    description: "A simulated system change needs review.",
    priority: 1,
    color: "#edc875",
    icon: "!",
  },
  {
    id: "being-watched",
    label: "Being watched",
    short: "Possible remote viewing",
    description: "A remote viewing signal was simulated.",
    priority: 2,
    color: "#a7a5ff",
    icon: "◉",
  },
  {
    id: "being-attacked",
    label: "Being attacked",
    short: "Repeated failed sign-ins",
    description: "A burst of failed sign-ins was simulated.",
    priority: 3,
    color: "#ff9a70",
    icon: "↗",
  },
  {
    id: "being-snooped",
    label: "Being snooped",
    short: "Canary file touched",
    description: "A simulated process touched a decoy file.",
    priority: 4,
    color: "#7ac9ff",
    icon: "⌕",
  },
  {
    id: "file-being-copied",
    label: "File being copied",
    short: "Bulk file activity",
    description: "Bulk reads and a removable-drive write were simulated.",
    priority: 5,
    color: "#d69bff",
    icon: "⇢",
  },
  {
    id: "someone-inside",
    label: "Someone is inside",
    short: "Remote sign-in",
    description: "A remote interactive sign-in was simulated.",
    priority: 6,
    color: "#ff7286",
    icon: "⌑",
  },
];

export const STATUS_BY_ID = Object.fromEntries(STATUS.map((status) => [status.id, status]));

export const SCENARIOS = {
  safe: [],
  "at-risk": [
    {
      id: "new-service",
      title: "Unfamiliar service added",
      detail: "A new service appeared in the startup inventory.",
      source: "SYSTEM CHANGE",
      confidence: "inferred",
      statusId: "at-risk",
    },
  ],
  "being-watched": [
    {
      id: "remote-view",
      title: "Possible remote viewing tool",
      detail: "A process name matched a remote access tool pattern.",
      source: "PROCESS PATTERN",
      confidence: "suspected",
      statusId: "being-watched",
    },
  ],
  "being-attacked": [
    {
      id: "failed-logons",
      title: "Repeated failed sign-ins",
      detail: "Several failed sign-in events occurred in a short window.",
      source: "SECURITY LOG · 4625",
      confidence: "confirmed",
      statusId: "being-attacked",
    },
    {
      id: "new-service-attack",
      title: "Unfamiliar service added",
      detail: "A new service appeared in the startup inventory.",
      source: "SYSTEM CHANGE",
      confidence: "inferred",
      statusId: "at-risk",
    },
  ],
  "being-snooped": [
    {
      id: "canary-touch",
      title: "Decoy file was touched",
      detail: "A process opened a protected canary file.",
      source: "CANARY FILE",
      confidence: "confirmed",
      statusId: "being-snooped",
    },
  ],
  "file-being-copied": [
    {
      id: "bulk-copy",
      title: "Bulk file activity detected",
      detail: "A burst of reads coincided with writes to removable storage.",
      source: "FILE + USB PATTERN",
      confidence: "inferred",
      statusId: "file-being-copied",
    },
  ],
  "someone-inside": [
    {
      id: "remote-logon",
      title: "Remote interactive sign-in",
      detail: "A successful remote sign-in was recorded from an unfamiliar source.",
      source: "SECURITY LOG · 4624",
      confidence: "confirmed",
      statusId: "someone-inside",
    },
  ],
};
