# WinSentinel

WinSentinel is a Windows security monitoring concept that presents system signals as one clear verdict and a live 3D view.

## Current milestone

Milestone 1 is a browser prototype. It contains a Three.js tower scene, a verdict priority model, seven selectable demo scenarios, a signal feed, and evidence confidence labels.

Every signal in this prototype is simulated. It does not read Windows event logs, inspect processes or files, access a camera or microphone, detect real attacks, or send alerts. The confidence label describes the example signal only; it is not an assessment of your computer.

## Run locally

Install Node.js 20.19+ or 22.12+, then run these commands from the project folder:

    npm install
    npm run dev

Open the local address printed by Vite. Use the scenario list to preview each verdict, choose **Next signal** to cycle through them, or choose **Reset** to return to Safe.

To create a static site bundle, run <code>npm run build</code>. The output is written to <code>dist/</code>.

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
