# WinSentinel active Remote Desktop session schema

Version: `1.0`

Run `scripts/Get-WinSentinelRemoteSessions.ps1` to list current local sessions using the Windows Terminal Services API. The script returns only sessions using the RDP protocol in `Active`, `Connected`, or `Disconnected` states. A disconnected session is not an active connection, but Windows may retain it for later reconnection.

## Fields

| Field | Type | Meaning |
| --- | --- | --- |
| `schemaVersion` | string | Normalized schema version (`1.0`). |
| `sessionId` | integer | Windows session identifier. |
| `sessionName` | string or null | Session name reported by Windows. |
| `state` | string | `Active`, `Connected`, or `Disconnected`. |
| `userName` | string or null | User associated with the session. |
| `domainName` | string or null | Account domain reported by Windows. |
| `clientReportedAddress` | string or null | Address reported by the RDP client for the session. |

## Limits and privacy

- The query is local and read-only. It does not change RDP settings, write files, or send data over the network.
- Windows may deny details for another session without the required query permission. Such an error is reported; the script does not elevate itself or change permissions.
- `clientReportedAddress` is the address reported by the RDP client, not guaranteed to be the actual network peer. NAT, VPN, Remote Desktop Gateway, or client software may make it unavailable or different. Do not use it to authenticate a client or identify an attacker. See Microsoft's [WTS client address documentation](https://learn.microsoft.com/en-us/windows/win32/api/wtsapi32/ns-wtsapi32-wts_client_address).
- No matching RDP sessions produce `[]`. The output can contain a username and IP address, so keep it local or redact it before sharing.