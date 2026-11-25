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

A service worker caches the app shell, so the screen also survives a fresh
load without internet (wifi/ uitval, mini-PC herstart). The weather lookup
fails silently and keeps the last known value.

## Deployen

GitHub Pages serves the `gh-pages` branch (root). After changes on `main`:

```bash
npm run build
git checkout gh-pages
rm -rf assets && cp dist/index.html . && cp -r dist/assets . && rm -rf dist
git add -A ':!node_modules' && git commit -m "Redeploy" && git push
git checkout main
```

`main` holds the source, `dev` is the development branch (merge into `main`
when done).

## Effects

The screen layers several particle effects, all monochrome on one canvas:

- **Seizoen** — automatic from the month (meteorological seasons):
  - lente (mrt–mei): zwevende bloesemblaadjes
  - zomer (jun–aug): stijgende, flikkerende vonken
  - herfst (sep–nov): vallende bladeren met nerven
  - winter (dec–feb): sneeuwvlokken met kristaltakken
- **Weer** — live regen of sneeuw via Open-Meteo (standaard Epe, of `?loc=`
  voor een vaste locatie; geen GPS, geen API-sleutel nodig). Ververst elke
  30 min.
- **Feest** — automatisch op de datum:
  - nieuwjaar (1 jan): vuurwerk
  - valentijn (14 feb): harten
  - pasen (computus, Goede Vrijdag–Paasmaandag): paaseieren
  - koningsdag (27 apr): ballonnen
  - sinterklaas (5–6 dec): pepernoten en cadeautjes
  - halloween (30 okt–1 nov): vleermuizen en pompoenen
  - kerst (24–26 dec): sneeuwvlokken en kerstballen

Effects stack (kerst = winterse sneeuw + kerstballen, plus regen als het
regent). Bij meerdere gelijktijdige effecten verdeelt een totaal-budget de
deeltjes, zodat het scherm nooit vol raakt.

## Overige schermelementen

- **Klok** — linksboven, met lopende seconden
- **Lesuren** — dagoverzicht onder de klok: alle uren + pauzes, het huidige
  uur helder met aftelklok `mm:ss`, de rest gedimd (60%/40%), op een zwarte
  plaat zodat effecten erachter verdwijnen
- **Overgangsblend** — in de laatste minuut van een uur mengt het artwork
  naar het thema van het volgende uur; in de eerste minuut loopt die
  overgang verder af
- **Mededeling-ticker** — scrollende tekst onderaan het scherm
- **Vakantie-countdown** — `Nog X dagen XX uren XX minuten XX seconden tot
  de vakantie!` zolang de `?tot=`-datum niet gepasseerd is

## Control panel (paneel)

Move the mouse to reveal the control panel (top left):

- **tijd** — simulate the clock (time + weekday) to preview any phase
- **thema** — lock the artwork theme, `auto (rooster)` follows the schedule,
  `uit` turns the artwork off completely
- **seizoen** — lock the season effect (`auto` uses the clock month, `uit` off)
- **weer** — lock the weather effect (`auto` uses live weather, `uit` off)
- **feest** — lock the holiday effect (`auto` uses the clock date, `uit` off)
- **tekst** — custom slide title override, with aan/uit toggle
- **tijd** — custom time range under the title, with aan/uit toggle
- **snelheid** — animation speed for artwork and particles (0.5x–3x, plus
  `eigen` free input)
- **grootte** — particle size multiplier (0.5x–50x, for a bit of goof)
- **overgang** — blend the artwork theme into the next lesson's theme during
  the last/first minute of a slot
- **mededeling** — scrolling ticker text at the bottom, with aan/uit toggle
- **lesuren** — day overview (all lessons + breaks, current one highlighted)

## URL parameters

| Param | Effect |
| --- | --- |
| `?at=HH:MM` | Preview the screen at a given time |
| `?dow=0-6` | Preview a weekday (0 = Sunday) |
| `?tot=<moment>` | Event countdown target (e.g. `2026-10-16T16:20`) |
| `?tekst=<label>` | Countdown caption |
| `?art=<id>` | Force one artwork theme (`?art=waves`, `?art=uit` for off) |
| `?seizoen=<id\|uit>` | Force one season (lente, zomer, herfst, winter) |
| `?weer=<regen\|sneeuw\|uit>` | Force weather |
| `?feest=<id\|uit>` | Force one holiday effect (nieuwjaar, valentijn, pasen, koningsdag, sinterklaas, halloween, kerst) |
| `?titel=<tekst>` | Custom slide title (overrides the schedule label) |
| `?tijd=<bereik>` | Custom time range under the title (e.g. `?tijd=10:20-11:05`) |
| `?snelheid=<x>` | Animation speed for artwork and particles (any positive value) |
| `?grootte=<x>` | Particle size multiplier (any positive value) |
| `?overgang=uit` | Disable the transition blend |
| `?mededeling=<tekst>` | Scrolling ticker text at the bottom |
| `?lesuren=uit` | Hide the day overview |
| `?loc=lat,lon` | Fixed location for the weather lookup |

Artwork themes: halftone, tunnel, orbit, streams, grid, moire, solid, radar,
bars, spiral, spark, ripple, waves, constellation, scan.
