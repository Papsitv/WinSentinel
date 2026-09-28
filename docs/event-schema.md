# WinSentinel local sign-in event schema

Version: `1.0`

The local PowerShell collector emits one JSON array of normalized records from the Windows Security log. It reads event IDs 4624 (successful logon) and 4625 (failed logon) with `Get-WinEvent`. Each record corresponds to an observed Windows event, not a verdict about malicious activity.

## Fields

| Field | Type | Meaning |
| --- | --- | --- |
| `schemaVersion` | string | Normalized schema version (`1.0`). |
| `eventId` | integer | Windows event ID: `4624` or `4625`. |
| `recordId` | integer or null | Record number assigned by the local event log. |
| `timeUtc` | ISO 8601 string | Event timestamp converted to UTC. |
| `computer` | string or null | Computer name reported by the event record. |
| `result` | string | `success` for 4624, `failure` for 4625. |
| `logonType` | string or null | Windows logon type value from the event. |
| `accountName` | string or null | Target account name recorded by Windows. |
| `accountDomain` | string or null | Target account domain recorded by Windows. |
| `sourceAddress` | string or null | The event's `IpAddress` value. Empty and `-` values become `null`; otherwise the value is preserved as recorded. |
| `sourcePort` | integer or null | Numeric `IpPort` value, when present. |
| `workstation` | string or null | Workstation name recorded by Windows, when present. |
| `failureStatus` | string or null | Raw `Status` field from a failed-logon event, when present. |
| `failureSubStatus` | string or null | Raw `SubStatus` field from a failed-logon event, when present. |
| `failureReason` | string or null | Raw `FailureReason` field from a failed-logon event, when present. |

Fields unavailable in a particular event are `null`. The collector parses the event's named XML data fields rather than localized display text.

## Remote-only view

Pass `-RemoteOnly` to keep only logon type 3 (network), 10 (remote interactive), and 12 (cached remote interactive) events. Type 3 is a network logon and does not by itself mean Remote Desktop; type 10 is the Remote Desktop/Terminal Services interactive logon. Windows documents the event fields and types in [event 4624](https://learn.microsoft.com/windows/security/threat-protection/auditing/event-4624) and the [logon type enumeration](https://learn.microsoft.com/en-us/windows/win32/api/ntsecapi/ne-ntsecapi-security_logon_type).

`-MaxEvents` limits the matching event query. If the returned output reaches that limit, increase `-MaxEvents` and rerun to look farther back within the selected time window.

## Example

```json
[
  {
    "schemaVersion": "1.0",
    "eventId": 4624,
    "recordId": 12345,
    "timeUtc": "2026-09-28T12:34:56.0000000Z",
    "computer": "MY-PC",
    "result": "success",
    "logonType": "10",
    "accountName": "alex",
    "accountDomain": "MY-PC",
    "sourceAddress": "203.0.113.24",
    "sourcePort": 51432,
    "workstation": null,
    "failureStatus": null,
    "failureSubStatus": null,
    "failureReason": null
  }
]
```

The sample uses the documentation-only TEST-NET-3 address `203.0.113.0/24`; it is not a real peer address.

## Limits and privacy

- The collector reads only the local `Security` event log and does not change Windows settings, clear logs, write files, contact a server, or send notifications. JSON goes to standard output; redirect it to a file only if you choose to.
- Access depends on the machine's event-log permissions and audit policy. No matching records produce `[]`; access or query errors are reported on standard error and return a nonzero exit code.
- Windows may record an address as blank, `-`, a loopback address, or an intermediate host. `sourceAddress` is only the value in that event; it does not identify an attacker or reveal the origin behind a VPN, proxy, NAT, or relay.
- A successful sign-in can be legitimate. Failed sign-ins can come from typos, saved credentials, or services. These events alone do not prove an intrusion.
- The browser demo still uses simulated signals. Connecting local event data to the dashboard requires a separate, explicit local integration boundary; this collector does not expose an HTTP service.