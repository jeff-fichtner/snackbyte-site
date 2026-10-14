# Cloud Run min-instances

**Mechanism: done.** `cloudbuild.yaml` now passes `--min-instances`, driven by the
`_MIN_INSTANCES` substitution. Staging is forced to `0` in the deploy step (derived
from `_APP_ENV`, so the deploy job's `--substitutions` line stays byte-identical to
every other app's).

**Decision: on, production only** (owner, 2026-10-13). `_MIN_INSTANCES` is `1`, so
production keeps one warm instance. Staging stays at `0`: the deploy step forces it from
`_APP_ENV`, whatever the default says.

Measured before the change (production logs, 2026-10-11 to 13): of 220 homepage requests
the median was 5 ms but the slowest 5% took over 2.4 s and the worst 9.0 s, against the
homepage's own target of words on screen within two seconds. 486 cold starts were logged
from 2026-09-29.

## Why it matters

At `0` the service scales to zero when idle, and the first request after idle pays a
full container boot plus Node warm-up. That is fine while the site is a holding page
and nobody is hitting it. It is a bad first impression once a real page is being sent
to someone deliberately.

## To turn it on

Change the default in `cloudbuild.yaml`:

```yaml
_MIN_INSTANCES: '1'
```

Costs one always-on instance — a few dollars a month at this size, billed at Cloud
Run's reduced idle CPU rate plus memory. Check current pricing before flipping.

## Definition of done

- [x] `--min-instances` baked into the deploy, production-only, staging pinned to 0
- [x] v1 is live and verified at snackbyte.io
- [x] `_MIN_INSTANCES` flipped to `1`
- [ ] Confirmed: `gcloud run services describe snackbyte-site --region=us-central1 --format='value(spec.template.metadata.annotations.autoscaling.knative.dev/minScale)'` returns `1`
- [ ] First-request latency after idle checked
