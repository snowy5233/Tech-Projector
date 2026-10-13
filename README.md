# tech-projector

Projection screen for the school tech lab: schedule, clock, countdown and
generative 1-bit canvas artwork that changes with the timetable.

Built with React + Vite. Strictly black and white, so it survives low-contrast
projectors.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

The page clicks into fullscreen. Corner-pin keystone handles appear while the
mouse moves.

## URL parameters

| Param   | Effect                                                       |
| ------- | ------------------------------------------------------------ |
| `?at=HH:MM` | Preview the screen at a given time                        |
| `?dow=0-6` | Preview a weekday (0 = Sunday)                             |
| `?tot=<moment>` | Event countdown target (e.g. `2026-10-16T16:20`)     |
| `?tekst=<label>` | Countdown caption                                      |
| `?art=<id>` | Force one artwork theme (`?art=waves`)                     |

Artwork themes: halftone, tunnel, orbit, streams, grid, moire, solid, radar,
bars, spiral, spark, ripple, waves, constellation, scan.
