# WinSentinel

WinSentinel is a Windows security monitoring concept that presents system signals as one clear verdict and a live 3D view.

## Current milestone

Milestone 1 is a browser prototype. It contains a Three.js tower scene with state-specific motion, a verdict priority model, seven selectable demo scenarios, a signal feed, evidence confidence labels, and state-specific security suggestions.

Every signal in this prototype is simulated. It does not read Windows event logs, inspect processes or files, access a camera or microphone, detect real attacks, or send alerts. The remote sign-in examples use TEST-NET addresses reserved for documentation under [RFC 5737](https://www.rfc-editor.org/rfc/rfc5737.html); they are not observed IP addresses and cannot identify an attacker or VPN endpoint. The confidence label describes the example signal only; it is not an assessment of your computer.

## Run locally

Install Node.js 20.19+ or 22.12+, then run these commands from the project folder:

    npm install
    npm run dev

Open the local address printed by Vite. Use the scenario list to preview each verdict, choose **Next signal** to cycle through them, or choose **Reset** to return to Safe.

To create a static site bundle, run <code>npm run build</code>. The output is written to <code>dist/</code>.

## Publish to GitHub Pages

The 3D scene is drawn in a WebGL canvas; it does not use image files. The Pages deployment workflow builds the app into static files before publishing them.

To publish, set the repository's Pages source to **GitHub Actions** under **Settings → Pages → Build and deployment**. A push to <code>main</code> then builds and deploys <code>dist/</code> using <code>.github/workflows/deploy-pages.yml</code>. The workflow can also be started manually from the Actions tab.

## Demo verdicts

| Verdict | Example signal shown |
| --- | --- |
| Safe | No active demo signals |
| At risk | An unfamiliar service was added |
| Being watched | A possible remote viewing tool was seen |
| Being attacked | A burst of failed sign-ins was recorded |
| Being snooped | A decoy canary file was touched |
| File being copied | Bulk reads and a removable-drive write were seen |
| Someone is inside | A remote interactive sign-in was recorded |

When several signals are active, the verdict model selects the highest-priority status. That is a UI rule for this demo, not a real-world threat score.

## Planned work

1. Review the 3D presentation and demo wording.
2. Define documented event schemas and add read-only Windows signal collectors. Local sign-in and active Remote Desktop session collectors are implemented, with a local-only snapshot import for the development dashboard.
3. Add file, removable-drive, process, and network observations with explicit confidence and known limitations. The local snapshot now includes a point-in-time list of established TCP connections; it does not classify peers as malicious.
4. Consider a Windows desktop shell, service hardening, and optional phone alerts after the sensors and verdict rules are validated.

## Milestone 2: local Windows observations

The read-only collector in `scripts/Get-WinSentinelSignInEvents.ps1` queries local Windows Security events 4624 and 4625 and prints normalized JSON to the PowerShell console. See [`docs/event-schema.md`](docs/event-schema.md) for fields and limitations. It does not change Windows settings, write a file, or send data over the network. Access depends on local Security log permissions and audit policy.

From PowerShell in the project folder, run:

    .\scripts\Get-WinSentinelSignInEvents.ps1 -SinceHours 24 -MaxEvents 200 -RemoteOnly

For current RDP sessions, run:

    .\scripts\Get-WinSentinelRemoteSessions.ps1

See [docs/active-sessions.md](docs/active-sessions.md). Its client-reported address may differ from the network peer. The sign-in event address, when present, is only the peer value Windows recorded. It cannot identify an attacker or reveal an origin behind a VPN, proxy, NAT, or relay.

To create one combined snapshot for the local dashboard, run this in PowerShell 7 from the project folder:

    .\scripts\Get-WinSentinelSnapshot.ps1 -SinceHours 24 -MaxEvents 200 > .\winsentinel-snapshot.json
    npm run dev

Open the local Vite address, choose **Load local snapshot**, and select `winsentinel-snapshot.json`. The snapshot is created only because you redirected the script's console output to a file. The dashboard accepts it only on `localhost` or `127.0.0.1`, keeps the imported data in the current browser tab's memory, and does not upload or persist it. **Clear local data** removes the imported records from the page; delete the JSON file yourself when you no longer need it. The file is ignored by Git. Do not upload or commit it.

The local observations panel is separate from the simulated verdict and demo controls. It lists network/remote sign-in events (logon types 3, 10, and 12), RDP sessions, and established TCP connections reported by Windows. Ordinary logons and network connections are not treated as attacks. A TCP peer address does not identify an attacker or reveal an origin behind a VPN, proxy, NAT, or relay. The connection list is a point-in-time view, not a traffic history. GitHub Pages continues to show simulated data and does not accept local snapshots.

See [docs/local-snapshot.md](docs/local-snapshot.md) for the snapshot schema, import boundary, and field limitations.

## Technology

- JavaScript modules and Vite for local development and static builds
- Three.js for the 3D scene
- No Python sensor or desktop shell is connected yet

## License

MIT. See [LICENSE](LICENSE).
