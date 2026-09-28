# Local WinSentinel snapshot

Version: `1.0`

`scripts/Get-WinSentinelSnapshot.ps1` runs read-only sign-in, RDP session, and established TCP connection collectors in separate PowerShell 7 child processes, then prints one JSON object to standard output. It does not itself create a file. Redirect the output only when you want to save a snapshot:

```powershell
.\scripts\Get-WinSentinelSnapshot.ps1 -SinceHours 24 -MaxEvents 200 > .\winsentinel-snapshot.json
```

The generated file is local machine data. The repository ignores `winsentinel-snapshot*.json` so it is not accidentally added to Git. Keep it on your PC and delete it when you no longer need it.

## Shape

The top-level object contains:

| Field | Type | Meaning |
| --- | --- | --- |
| `schemaVersion` | string | Snapshot schema version (`1.0`). |
| `collectedAtUtc` | ISO 8601 string | Time the local queries finished. |
| `sinceHours` | integer | Time window used for sign-in event collection. |
| `signInEvents` | array | Normalized local Security log events; see [event schema](event-schema.md). |
| `remoteSessions` | array | Current RDP sessions; see [active session schema](active-sessions.md). |
| `networkConnections` | array | Established TCP connections at collection time; see [network observations](network-observations.md). Optional when importing earlier version `1.0` snapshots. |

The browser panel shows sign-in event types 3, 10, and 12. Type 3 means a Windows network logon and does not by itself mean Remote Desktop. Type 10 is a Remote Desktop/Terminal Services interactive logon. Type 12 is cached remote interactive logon. The panel shows at most the 100 most recent matching sign-in events and the first 100 established TCP connections in the snapshot. Session rows include Active, Connected, or Disconnected sessions, with the account and address reported by the client when available. Established connections are a point-in-time view, not a history or threat verdict.

## Local import boundary

- The **Load local snapshot** control is available only when the page is served from `localhost`, `127.0.0.1`, or IPv6 loopback. Run `npm run dev` from the project folder; Vite is configured to bind to `127.0.0.1`.
- The browser reads the file selected by you and holds the records in that tab's memory. It does not use local storage, send a request, or start a network listener for the snapshot.
- **Clear local data** removes imported records from the page. It does not delete the JSON file from disk.
- The local observations panel is distinct from the demo verdict. The demo verdict and scenarios remain simulated and are not derived from the imported records.
- GitHub Pages remains simulated and does not show this local snapshot panel.

An address in a sign-in event is the value Windows recorded. The RDP client address is reported by that client. Either can be absent or can reflect an intermediate host due to VPN, proxy, NAT, gateway, or relay routing. Neither field identifies an attacker or proves a machine was accessed maliciously. Empty results mean that the local query returned no matching records or sessions, not that the PC has been proven safe.
