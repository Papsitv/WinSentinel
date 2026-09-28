# Local established TCP connection observations

`scripts/Get-WinSentinelNetworkConnections.ps1` reads established TCP connections visible to the local Windows networking stack with `Get-NetTCPConnection`. It reports up to 500 rows by default; use `-MaxConnections` to choose a limit from 1 to 5000. No DNS lookups, geolocation, reputation checks, or external requests are performed.

## Fields

| Field | Type | Meaning |
| --- | --- | --- |
| `schemaVersion` | string | Record schema version (`1.0`). |
| `protocol` | string | Always `TCP`. |
| `state` | string | TCP state; this collector returns `Established` only. |
| `localAddress` / `localPort` | string / integer | Local endpoint reported by Windows. |
| `remoteAddress` / `remotePort` | string / integer | Remote peer endpoint reported by Windows. |
| `processId` | integer | Owning process ID reported by Windows. |
| `processName` | string or null | Best-effort process name; it may be unavailable if the process exits or access is denied. |

The snapshot includes these records under `networkConnections`. The dashboard shows at most the first 100 records; the snapshot itself defaults to a maximum of 500. The snapshot collector captures connections at one point in time, while sign-in events use the selected lookback window.

## Limits and privacy

- A TCP connection is not evidence of an intrusion. Browsers, update services, messaging apps, and other normal software maintain established connections.
- An address is only the peer value reported by Windows. It does not reveal the origin behind VPN, proxy, NAT, relay, or hosting infrastructure and cannot identify an attacker.
- This is not a traffic capture, a firewall audit, an inbound-listener inventory, or a history of connection changes. UDP is not included.
- The collector only reads local connection and process metadata, writes no files, changes no settings, and sends no data. The combined snapshot can contain sensitive local information; keep it on the device and do not commit it.
- The browser imports a snapshot only on localhost and holds it in the tab's memory. GitHub Pages does not show local observations.
