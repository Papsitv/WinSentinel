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
2. Define a documented event schema and add read-only Windows signal collectors, starting with sign-in events and active remote sessions.
3. Add file, removable-drive, process, and network observations with explicit confidence and known limitations.
4. Consider a Windows desktop shell, service hardening, and optional phone alerts after the sensors and verdict rules are validated.

## Technology

- JavaScript modules and Vite for local development and static builds
- Three.js for the 3D scene
- No Python sensor or desktop shell is connected yet

## License

MIT. See [LICENSE](LICENSE).
