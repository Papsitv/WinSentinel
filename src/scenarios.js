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
    sceneLabel: "BASELINE",
    sceneDirection: "No active signal",
    recommendations: [
      "Keep Windows, your browser, and router firmware updated.",
      "Keep Defender and Windows Firewall on; use WPA2/WPA3 Wi-Fi encryption.",
      "Use MFA on important accounts and keep a separate backup.",
    ],
  },
  {
    id: "at-risk",
    label: "At risk",
    short: "System change",
    description: "A simulated system change needs review.",
    priority: 1,
    color: "#edc875",
    icon: "!",
    sceneLabel: "CHANGE DETECTED",
    sceneDirection: "Local system change",
    recommendations: [
      "Check the service name, publisher, path, and install time.",
      "Run a Windows Security scan if you do not recognize it.",
      "Avoid deleting a service until you identify what uses it.",
    ],
  },
  {
    id: "being-watched",
    label: "Being watched",
    short: "Possible remote viewing",
    description: "A remote viewing signal was simulated.",
    priority: 2,
    color: "#a7a5ff",
    icon: "◉",
    sceneLabel: "REMOTE OBSERVER",
    sceneDirection: "Possible remote access",
    recommendations: [
      "Review installed remote-support and unattended-access tools.",
      "Turn off Remote Desktop if you do not use it.",
      "Review which apps can use your camera and microphone.",
    ],
  },
  {
    id: "being-attacked",
    label: "Being attacked",
    short: "Repeated failed sign-ins",
    description: "A burst of failed sign-ins was simulated.",
    priority: 3,
    color: "#ff9a70",
    icon: "↗",
    sceneLabel: "SIGN-IN BURST",
    sceneDirection: "Inbound attempts",
    recommendations: [
      "Use MFA or Windows Hello on important accounts.",
      "Turn off Remote Desktop if unused; keep the firewall on.",
      "Review sign-in times and account names before responding.",
    ],
  },
  {
    id: "being-snooped",
    label: "Being snooped",
    short: "Canary file touched",
    description: "A simulated process touched a decoy file.",
    priority: 4,
    color: "#7ac9ff",
    icon: "⌕",
    sceneLabel: "LOCAL SCAN",
    sceneDirection: "Canary file touched",
    recommendations: [
      "Check the process name, file path, and event time.",
      "Run a full scan if the process is unfamiliar.",
      "Enable Controlled Folder Access for important folders.",
    ],
  },
  {
    id: "file-being-copied",
    label: "File being copied",
    short: "Bulk file activity",
    description: "Bulk reads and a removable-drive write were simulated.",
    priority: 5,
    color: "#d69bff",
    icon: "⇢",
    sceneLabel: "OUTBOUND COPY",
    sceneDirection: "Local → external",
    recommendations: [
      "If unexpected, review the process and destination drive/share.",
      "Disconnect an unknown removable drive while you investigate.",
      "Review cloud sharing and enable Controlled Folder Access.",
    ],
  },
  {
    id: "someone-inside",
    label: "Someone is inside",
    short: "Remote sign-in",
    description: "A remote interactive sign-in was simulated.",
    priority: 6,
    color: "#ff7286",
    icon: "⌑",
    sceneLabel: "REMOTE SESSION",
    sceneDirection: "Active sign-in",
    recommendations: [
      "Verify the account, sign-in time, and whether the session is yours.",
      "If unexpected, end the session and disable remote access temporarily.",
      "Change affected passwords from a trusted device and review MFA.",
    ],
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
      networkFootprint: {
        address: "198.51.100.24",
        label: "SIMULATED SOURCE IP",
        note: "TEST-NET example · VPN/proxy origin unknown",
      },
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
      networkFootprint: {
        address: "203.0.113.42",
        label: "SIMULATED REMOTE PEER",
        note: "TEST-NET example · VPN/proxy origin unknown",
      },
    },
  ],
};
