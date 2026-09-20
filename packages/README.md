# packages/

Three packages, three lifetimes.

| Package | Stack | Lifetime |
|---|---|---|
| `prototype-pwa/` | PWA (web) + FastAPI (server) | **Throwaway.** Validates recording and real-time claim display, then dies. |
| `back/` | Python pipeline + real-time server | Production. Stages 1–4, 3bis, and the relay. |
| `front/` | TBD — decision D-01 | Production UI. |

The prototype never imports from `back/` or `front/`, and neither ever imports from the prototype.
What crosses over is knowledge, not code: what worked, what the latency really was, which contract
turned out wrong. Write that into `docs/ai-harness/findings/` when the prototype is done.

JS/TS packages are pnpm workspace members (`pnpm-workspace.yaml`). Python packages keep their own
virtualenv and `pyproject.toml` / `requirements.txt` — pnpm does not manage them.
