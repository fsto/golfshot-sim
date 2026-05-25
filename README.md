# Golfshot Sim

A browser-only, physics-accurate golf shot simulator. Enter Trackman-style launch monitor
inputs, see the ball flight, bounce and roll out in 3D, side-profile and top-down.

**Live demo:** https://fsto.github.io/golfshot-sim/

No backend. No accounts. The full physics + UI ships as a static bundle; everything runs
in your browser.

## What it does

- **Two input modes**, toggled at the top of the page:
  - **Club Delivery** (default) — clubhead speed, smash factor, attack angle, club path,
    face angle, dynamic loft. The D-plane model derives ball-launch from these.
  - **Ball Launch** — radar-style ball speed, launch angle, azimuth, backspin, spin axis.
- **11 PGA Tour club presets** (Driver → PW) anchored to published ShotLink averages. Each
  preset's "neutral" delivery reproduces its documented tour-average ball launch exactly
  through the D-plane.
- **Smash factor as a per-strike variable** — slider in the Club Delivery form with a hard
  cap at the preset's tour-average ("perfect") smash. You can be less efficient than
  perfect, never more.
- **Full environment panel** — temperature, pressure, humidity, altitude, wind speed and
  direction, landing surface (Green / Fairway / Rough).
- **3D driving range** (react-three-fiber + Three.js) with a 35-unit fairway lane,
  distance markers laid flat on the turf, sky shader, free-orbit camera (drag rotates,
  scroll zooms, right-click pans, arrow keys pan).
- **Side-profile and top-down 2D plots** (Recharts), both maintained at 1 : 1 data aspect
  so the trajectory shape is truthful rather than stretched.
- **Shot history (up to 10)** — every saved shot draws as a dimmed colored trace in all
  three views, with a chip in the history panel showing total distance.
- **Monte-Carlo dispersion** — per-field σ on the relevant inputs, N=10..500 runs in a
  Web Worker, render the landing cloud + 95 % covariance ellipse on the turf and a scatter
  in the top-down plot. The readout switches to mean ± σ for carry/total/side while a
  result is active.
- **Shareable URL** — Copy Link snapshots the full input state into the URL hash and
  rehydrates on load. Send a link to a peer and they see your exact shot.
- **Units toggle** — Imperial / Metric for distances and temperatures (Trackman convention:
  club / ball / wind speed always in mph).
- **Mobile-friendly** — input panels stack under the visualizations on narrow screens.

## Physics, briefly

All physics is SI-internal in `src/physics/**`. Conversions happen at module boundaries.

### Flight

3-DoF point-mass with drag + Magnus lift + gravity, integrated with classical RK4 at
dt = 2 ms. Ground crossing is linearly interpolated within the last step.

```
F = ½ ρ A |v_rel|² [ −C_d v̂_rel  +  C_l (ŝ × v̂_rel) ]  +  m g
v_rel = v − v_wind
```

- **Lift coefficient** `C_L(S) = 0.30 · (1 − exp(−10·S))`
- **Drag coefficient** `C_D(S) = 0.24 + 0.30·S²`
- **Spin ratio** `S = ω·R / |v_rel|`

Saturating-exponential lift + quadratic-spin drag fit to Smits & Smith (1994) and
Bearman & Harvey (1976) wind-tunnel data. Spin decays exponentially with τ = 35 s
(Tavares-style). Air density via ISA + Arden Buck humidity correction.

### Club → ball (D-plane)

Modern Trackman ball-flight laws, anchored to each preset's neutral delivery:

```
ballSpeed       = clubSpeed × min(input.smash, preset.smash_cap)
start direction = 0.85 × face + 0.15 × path        (face dominates ~85 %)
spin axis       = face − path                       (positive = fade/slice)
launch angle    = tourAvg.launch + 0.85·ΔdynLoft + 0.20·Δattack
backspin        = tourAvg.spin × (1 + 0.07·ΔspinLoft) × ballSpeed/avg.ballSpeed
```

### Bounce + roll

Penner (2002) — single rigid-body impact with sliding friction acting opposite to the
contact-patch slip velocity (`ω × r` against the downward radius). Up to 6 bounces with
secondary flight arcs between them, then a straight-line roll with rolling friction
`μ_roll · g · v̂` until the ball stops.

Surface defaults (calibrated from Penner + launch-monitor publications):

| Surface  | COR  | μ_slide | μ_roll | spinRetention |
|---------:|:----:|:-------:|:------:|:-------------:|
| Green    | 0.50 | 0.40    | 0.08   | 0.65          |
| Fairway  | 0.40 | 0.50    | 0.18   | 0.55          |
| Rough    | 0.25 | 0.80    | 0.45   | 0.30          |

### Calibration

Every preset's neutral delivery is run through `simulateShot` against a calibration test
at sea-level ISA, no wind:

- Driver / 7i / PW / 8i / 9i within ±4 % of their tour-average carry
- 3W / 5W / 3i / 4i / 5i / 6i within ±15 % (mid-S regime; documented limitation —
  see `src/presets/calibration.test.ts` for the long form)

The mid-iron drift is the cost of fitting all clubs with a single global Cd/Cl formula
rather than a (Re, S) interpolation table. The plan note: replace the closed-form
coefficients with a table interpolated from Bearman/Smits raw data points and bring
every club within 3 %.

## Stack

- **React 19** + **Vite 5** + **TypeScript** (strict, `exactOptionalPropertyTypes`,
  `noUncheckedIndexedAccess`)
- **Three.js** + **react-three-fiber** + **drei** for the 3D scene
- **Recharts v3** for the 2D plots
- **Zustand v5** for state (three stores: shot inputs, history, dispersion result)
- **Web Worker** (Vite module-worker URL import) for the Monte-Carlo runs
- **Vitest** + **@testing-library/react** + **jsdom** for tests

## Project structure

```
src/
  physics/                Pure, SI-internal, no React / Three.js / Zustand
    constants.ts            G, ball mass + radius, ISA constants
    types.ts                Vec3, ShotInput, EnvConditions, ShotResult, ClubPreset, …
    units.ts                mph↔m/s, yd↔m, rpm↔rad/s, °F↔°C, inHg↔Pa, …
    atmosphere.ts           airDensity(env), isaPressure(h)
    aero.ts                 cd(S), cl(S), spinRatio, reynoldsNumber
    spin.ts                 decaySpin, SPIN_DECAY_TAU_S
    integrator.ts           classical RK4 over Kinematic state
    forces.ts               drag + Magnus + gravity (+ optional Coriolis hook)
    coriolis.ts             −2 Ω × v, north-aimed local frame
    flight.ts               simulateFlight + simulateFlightFromState (ground-crossing interp)
    bounce.ts               Penner impulse
    roll.ts                 straight-line roll under rolling friction
    dplane.ts               clubToBall(delivery, preset)
    dispersion.ts           batch perturbed simulateShot
    shot.ts                 simulateShot — top-level entry; runs flight → bounce loop → roll

  presets/
    pgaPresets.ts           14 clubs with neutralDelivery + tourAvg
    surfaces.ts             COR / friction / spinRetention / rollFriction per Surface
    calibration.test.ts     every preset's neutral delivery vs its carry target

  state/                  Zustand stores — no Three.js, no DOM
    shotStore.ts            inputs + env + dispersion config; setMode/setUnits/setClub/…
    historyStore.ts         saved shots with palette colors
    dispersionStore.ts      lazy-init the worker, expose result/running

  hooks/
    useTrajectory.ts        debounce-free memoized simulateShot

  workers/
    dispersion.worker.ts    postMessage shell over simulateDispersion

  lib/
    math/vec3.ts, stats.ts, rng.ts
    format.ts               display-space ↔ SI converters per units mode
    shareState.ts           encode/decode/applyShareState for the URL hash
    useElementSize.ts       ResizeObserver hook for the 1:1 chart aspect

  ui/
    App.tsx, main.tsx, styles.css
    controls/               NumericField, UnitsToggle, ModeToggle, SurfacePicker,
                            SaveShotButton, ShareLinkButton
    panels/                 BallLaunchForm, ClubDeliveryForm, PresetPicker,
                            DerivedLaunchPanel, EnvPanel, DispersionPanel,
                            ReadoutPanel, HistoryPanel
    plots/                  SideProfilePlot, TopDownPlot
    scene/                  Scene, DrivingRange, BallTrace, GhostTrace, DispersionMarks
```

### Isolation rules

- `physics/**`: no `react`, no `three`, no `zustand`
- `state/**`: imports `physics/types` + `lib/**`; never calls `simulateShot` directly
- `ui/plots/**` and `ui/panels/**`: no `three`
- `ui/scene/**`: no `recharts`
- `workers/**`: only `physics/**` (keeps the worker bundle small + portable)

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173/
npm test             # vitest run
npm run typecheck    # tsc --noEmit
npm run build        # tsc --noEmit && vite build → dist/
```

## Deployment

Pushed commits to `main` auto-deploy to GitHub Pages via
[.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml). Production
builds use `base: '/golfshot-sim/'` (configured conditionally in
[vite.config.ts](vite.config.ts)) so asset URLs resolve under the project sub-path.

If you fork: enable Pages with workflow source via
```
gh api -X POST /repos/<you>/<your-fork>/pages -f build_type=workflow
```
and update `base` in `vite.config.ts`. For a custom domain or root deployment, set
`base: '/'`.

## Testing

```bash
npm test                                    # all
npx vitest run src/physics/                 # just physics
npx vitest run src/presets/calibration      # preset carry calibration
npx vitest run src/ui/App.test.tsx          # end-to-end smoke through jsdom
```

The App test mocks `./scene/Scene` because jsdom has no WebGL. Everything else is real.

Current size: **183 tests**, **~6 s** for the full suite.

## Bundle

`npm run build` produces ~480 KB main gzipped + ~11 KB worker gzipped. Three.js + drei
account for most of the main chunk.

## Known limitations

- Mid-iron carry (3i–6i) over-shoots its tour average by 9–15 %. Captured under a loose
  18 % calibration envelope. Documented in `src/presets/calibration.test.ts`. Fix is a
  Bearman/Smits 2-D table lookup (Re × S) replacing the closed-form Cd/Cl.
- No bunker / fringe / cart-path surfaces yet; the surface picker is fairway / green /
  rough only.
- Saved shots and dispersion results don't survive page reload (only inputs do, via the
  shareable URL hash).
- The 3D scene draws the **ground game** as a polyline on the turf instead of as
  bouncing arcs. Real bounce heights are <1 m and would be invisible at the camera
  distance; the side-profile plot still shows them as small bumps.

## Sources

The physics is grounded in published wind-tunnel and field studies:

- Bearman & Harvey, *Golf ball aerodynamics*, **Aeronautical Quarterly** 27 (1976) — Cd/Cl
  vs Re and spin ratio for dimpled balls.
- Smits & Smith, *A new aerodynamic model of a golf ball in flight* (1994) — saturating
  Cl(S) relationship that the formula here is fit against.
- Penner, *The run of a golf ball*, **Sports Engineering** (2002) — bounce + roll model.
- Tavares et al. (1999) — exponential spin decay.
- Trackman ShotLink PGA Tour averages — preset neutral deliveries and calibration
  targets.

---

Built in successive milestones M1 (physics core) through M8 (polish) with a steady TDD
cadence — physics primitives first, presets and D-plane on top, UI layered last.
