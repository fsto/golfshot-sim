# Golfshot Sim

Browser-only, physics-accurate golf shot simulator. Enter Trackman-style launch monitor
inputs, watch the ball fly, bounce and roll out in 3D + side-profile + top-down.

**Live demo:** https://fsto.github.io/golfshot-sim/

No backend, no accounts — the full physics + UI ships as a static bundle.

## Features

- **Two input modes**: *Club Delivery* (clubhead speed, smash factor, attack, path, face,
  dynamic loft — D-plane derives ball launch) or *Ball Launch* (radar-style ball speed,
  launch, azimuth, backspin, spin axis).
- **11 PGA Tour club presets** (Driver → PW) anchored to published ShotLink averages. Each
  preset's neutral delivery reproduces its tour-average ball launch through the D-plane.
- **Smash factor** as a per-strike variable, hard-capped at the preset's tour-average.
- **Full environment**: temperature, pressure, humidity, altitude, wind, surface
  (Green / Fairway / Rough).
- **3D driving range** (react-three-fiber) with free-orbit camera + **side-profile and
  top-down 2D plots** (Recharts) at 1 : 1 data aspect.
- **Shot history** up to 10 — every saved shot draws as a dimmed trace in all three views.
- **Monte-Carlo dispersion** — per-field σ, N = 10–500 runs in a Web Worker, landing
  cloud + 95 % covariance ellipse on the turf.
- **Shareable URL** — full input state snapshots into the URL hash.
- **Imperial / Metric** toggle. **Mobile-friendly** layout.

## Physics

SI-internal in `src/physics/**`. Conversions at module boundaries only.

### Flight

3-DoF point-mass with drag + Magnus lift + gravity, integrated with classical RK4 at
dt = 2 ms. Ground crossing linearly interpolated within the last step.

```
F = ½ ρ A |v_rel|² [ −C_d v̂_rel  +  C_l (ŝ × v̂_rel) ]  +  m g
v_rel = v − v_wind
S     = ω·R / |v_rel|
```

**CL(S) and CD(S)** are a 12-point piecewise-linear table stitched from Bearman & Harvey
(1976, S ≤ 0.25), Smits & Smith (1994), and Aoki et al. (2010, including the non-monotonic
CL decline at S > 0.5). Peak L/D ≈ 0.83 at S ≈ 0.25, matching Bearman's reported ~0.78.
See `src/physics/aero.ts`.

Spin decays exponentially with τ = 35 s (Tavares-style). Air density via ISA + Arden Buck
humidity correction.

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

Penner (2002) — rigid-body impact with sliding friction along the contact-patch slip
velocity. Up to 6 bounces with secondary flight arcs, then straight-line roll under
rolling friction `μ_roll · g · v̂` until the ball stops.

| Surface  | COR  | μ_slide | μ_roll | spinRetention |
|---------:|:----:|:-------:|:------:|:-------------:|
| Green    | 0.50 | 0.40    | 0.08   | 0.65          |
| Fairway  | 0.40 | 0.50    | 0.18   | 0.55          |
| Rough    | 0.25 | 0.80    | 0.45   | 0.30          |

### Calibration

Each preset's neutral delivery is gated against tour-average **carry** at sea-level ISA
(`src/presets/calibration.test.ts`) and against tour-published **apex height, hang time,
and descent angle** (`src/presets/trajectory.test.ts`). The trajectory-shape gates catch
regressions like "carry happens to match but the ball flies wrong" — the failure mode
that hid the old over-lifting CL/CD.

Current carry residuals: woods + mid-irons (3W, 5W, 3i–6i) within ±6 % (mid-irons ±3 %);
driver and long-irons/wedges within ±12 % — see *Known limitations*.

## Stack

- **React 19** + **Vite 5** + **TypeScript** (strict, `exactOptionalPropertyTypes`,
  `noUncheckedIndexedAccess`)
- **Three.js** + **react-three-fiber** + **drei** for the 3D scene
- **Recharts v3** for the 2D plots
- **Zustand v5** for state (shot inputs, history, dispersion result)
- **Web Worker** for the Monte-Carlo runs
- **Vitest** + **@testing-library/react** + **jsdom** for tests

## Project layout

```
src/
  physics/        Pure, SI-internal. cd/cl, RK4, forces, dplane, bounce, roll, shot
  presets/        pgaPresets, surfaces, calibration + trajectory tests
  state/          Zustand stores (no Three, no DOM)
  hooks/          useTrajectory
  workers/        dispersion.worker.ts
  lib/            math/vec3, stats, rng; format, shareState, useElementSize
  ui/             App + controls + panels + plots + scene
```

**Isolation rules**: `physics/**` has no React/Three/Zustand; `state/**` never calls
`simulateShot` directly; `ui/plots/**` + `ui/panels/**` import no Three; `ui/scene/**`
imports no Recharts; `workers/**` import only `physics/**`.

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173/
npm test             # vitest run
npm run typecheck    # tsc --noEmit
npm run build        # tsc --noEmit && vite build → dist/
```

## Testing

```bash
npm test                                    # all
npx vitest run src/physics/                 # just physics
npx vitest run src/presets/                 # carry + trajectory calibration
npx vitest run src/ui/App.test.tsx          # end-to-end smoke through jsdom
```

The App test mocks `./scene/Scene` (jsdom has no WebGL). Everything else is real.
**231 tests, ~6 s** for the full suite.

## Deployment

Pushes to `main` auto-deploy to GitHub Pages via
[.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml). Production
builds use `base: '/golfshot-sim/'` (set in [vite.config.ts](vite.config.ts)).

To fork: enable Pages with workflow source via
```
gh api -X POST /repos/<you>/<your-fork>/pages -f build_type=workflow
```
and update `base` in `vite.config.ts` (use `'/'` for custom domain or root deployment).

Bundle: `npm run build` produces ~480 KB main gzipped + ~11 KB worker gzipped.

## Known limitations

- **Driver / 7i–PW carries under-shoot Tour aggregates by 7–11 %.** The preset
  `tourAvg.launchDeg` for irons is 2.7–4.2° higher than current Trackman PGA-Tour
  averages — those numbers were tuned against the prior over-lifting CL/CD via
  compensating error. Refreshing the launch angles should bring every club within ±5 %.
- No bunker / fringe / cart-path surfaces — only fairway / green / rough.
- Saved shots and dispersion results don't survive page reload (only inputs do, via the
  shareable URL hash).
- The 3D scene draws the ground game as a polyline on the turf rather than bouncing arcs
  (real bounce heights are < 1 m and invisible at the camera distance; the side-profile
  plot still shows them).

## Sources

- Bearman & Harvey, *Golf ball aerodynamics*, **Aeronautical Quarterly** 27 (1976) —
  CL/CD vs Re and spin ratio for dimpled balls.
- Smits & Smith, *A new aerodynamic model of a golf ball in flight* (1994).
- Aoki et al., *Aerodynamic characteristics and flow pattern of a golf ball with rotation*,
  Procedia Engineering (2010) — CL/CD measurements up to S ≈ 0.5.
- Penner, *The run of a golf ball*, **Sports Engineering** (2002) — bounce + roll.
- Tavares et al. (1999) — exponential spin decay.
- Trackman ShotLink PGA-Tour averages — preset neutral deliveries and calibration targets.
