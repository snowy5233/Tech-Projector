# tech-projector

Projection screen for the school tech lab: schedule, clock, countdown and
generative 1-bit canvas artwork that changes with the timetable.

Built with React + Vite. Strictly black and white, so it survives low-contrast
projectors.

Live site: https://snowy5233.github.io/Tech-Projector/

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

The page clicks into fullscreen. Corner-pin keystone handles appear while the
mouse moves; the control panel does too.

## Deployen

GitHub Pages serves the `gh-pages` branch (root). After changes on `main`:

```bash
npm run build
git checkout gh-pages
rm -rf assets && cp dist/index.html . && cp -r dist/assets .
git add -A ':!node_modules' && git commit -m "Redeploy" && git push
git checkout main
```

`main` holds the source, `dev` is the development branch (merge into `main`
when done).

## Effects

The screen layers several particle effects, all monochrome:

- **Seizoen** — automatic from the month (meteorological seasons):
  - lente (mrt–mei): zwevende bloesemblaadjes
  - zomer (jun–aug): stijgende, flikkerende vonken
  - herfst (sep–nov): vallende bladeren met nerven
  - winter (dec–feb): sneeuwvlokken met kristaltakken
- **Weer** — live regen of sneeuw via Open-Meteo (geolocation, fallback
  Utrecht; geen API-sleutel nodig). Ververst elke 30 min.
- **Feest** — automatisch op de datum:
  - nieuwjaar (1 jan): vuurwerk
  - valentijn (14 feb): harten
  - pasen (computus, Goede Vrijdag–Paasmaandag): paaseieren
  - koningsdag (27 apr): ballonnen
  - sinterklaas (5–6 dec): pepernoten en cadeautjes
  - halloween (31 okt–1 nov): vleermuizen en pompoenen
  - kerst (24–26 dec): sneeuwvlokken en kerstballen

Effects stack: op kerst zie je winterse sneeuw én kerstballen, plus regen
als het regent.

## Control panel (paneel)

Move the mouse to reveal the control panel (top left):

- **tijd** — simulate the clock (time + weekday) to preview any phase
- **thema** — lock the artwork theme, `auto (rooster)` follows the schedule,
  `uit` turns the artwork off completely
- **seizoen** — lock the season effect (`auto` uses the clock month)
- **weer** — lock the weather effect (`auto` uses live weather, `uit` off)
- **feest** — lock the holiday effect (`auto` uses the clock date)

## URL parameters

| Param | Effect |
| --- | --- |
| `?at=HH:MM` | Preview the screen at a given time |
| `?dow=0-6` | Preview a weekday (0 = Sunday) |
| `?tot=<moment>` | Event countdown target (e.g. `2026-10-16T16:20`) |
| `?tekst=<label>` | Countdown caption |
| `?art=<id>` | Force one artwork theme (`?art=waves`, `?art=uit` for off) |
| `?seizoen=<id>` | Force one season (lente, zomer, herfst, winter) |
| `?weer=<id>` | Force weather (regen, sneeuw, uit) |
| `?feest=<id>` | Force one holiday effect (nieuwjaar, valentijn, pasen, koningsdag, sinterklaas, halloween, kerst) |
| `?loc=lat,lon` | Fixed location for the weather lookup |
| `?titel=<tekst>` | Custom slide title (overrides the schedule label) |
| `?tijd=<bereik>` | Custom time range under the title (e.g. `?tijd=10:20-11:05`) |
| `?snelheid=<x>` | Animation speed for artwork and particles (0.5, 1, 1.5, 2, 3) |

Artwork themes: halftone, tunnel, orbit, streams, grid, moire, solid, radar,
bars, spiral, spark, ripple, waves, constellation, scan.
