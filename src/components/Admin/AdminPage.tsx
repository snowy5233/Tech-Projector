import { useEffect, useState } from 'react';
import {
  fetchRemote,
  remoteEnabled,
  writeRemote,
  type RemoteBeeld,
} from '../../lib/remoteConfig';
import { ARTWORK_MODE_IDS } from '../Artwork/createArtworkModes';
import { SEASONS } from '../Seasonal/SeasonalOverlay';
import { HOLIDAY_IDS } from '../../lib/holidays';
import { SPEEDS, SIZE_SCALES } from '../../hooks/useDebugConfig';
import { formatSlotTime, SLOTS } from '../../data/schedule';
import './admin.css';

/** Eenvoudige pin tegen per ongeluk bedienen. Verander deze hier. */
const ADMIN_PIN = '1234';

const leeg: RemoteBeeld = {
  titel: '',
  titelOn: true,
  tijd: '',
  tijdOn: true,
  mededeling: '',
  mededelingOn: true,
  thema: 'auto',
  seizoen: 'auto',
  weer: 'auto',
  feest: 'auto',
  snelheid: undefined,
  grootte: 1,
  lesurenOn: true,
  overgangOn: true,
};

/**
 * Globaal admin-paneel: bedien het projector-beeld op afstand.
 * Open op een telefoon/laptop: <site-url>/#admin
 */
export const AdminPage = () => {
  const [pinOk, setPinOk] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [beeld, setBeeld] = useState<RemoteBeeld>(leeg);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (!pinOk) return;
    void fetchRemote().then((data) => {
      if (data) setBeeld({ ...leeg, ...data });
    }).catch(() => setStatus('Ophalen mislukt'));
  }, [pinOk]);

  if (!remoteEnabled()) {
    return (
      <main className="admin">
        <h1>Admin</h1>
        <p>Remote bediening staat nog niet aan: vul de databaseUrl in
          <code> src/lib/firebase-config.ts</code> en deploy opnieuw.
          Zie README voor de setup.</p>
      </main>
    );
  }

  if (!pinOk) {
    return (
      <main className="admin">
        <h1>Admin</h1>
        <form
          className="admin__row"
          onSubmit={(event) => {
            event.preventDefault();
            if (pinInput === ADMIN_PIN) setPinOk(true);
            else setStatus('Verkeerde pin');
          }}
        >
          <label>
            pin
            <input
              type="password"
              inputMode="numeric"
              value={pinInput}
              onChange={(event) => setPinInput(event.target.value)}
            />
          </label>
          <button type="submit">open</button>
          <small>{status}</small>
        </form>
      </main>
    );
  }

  const set = (patch: RemoteBeeld) => setBeeld((vorig) => ({ ...vorig, ...patch }));
  const stuur = (patch?: RemoteBeeld) => {
    const volledig = { ...beeld, ...patch };
    writeRemote(volledig)
      .then(() => setStatus(`Verstuurd ${new Date().toLocaleTimeString('nl-NL')}`))
      .catch(() => setStatus('Versturen mislukt — verbinding/Firebase-regels?'));
    if (patch) setBeeld(volledig);
  };

  return (
    <main className="admin">
      <h1>Beeld op afstand</h1>

      <div className="voorbeeld" aria-hidden="true">
        <div className="voorbeeld__scherm">
          <div className="voorbeeld__thema">TECHLAB</div>
          <div className="voorbeeld__lesuren" hidden={!beeld.lesurenOn}>
            {SLOTS.map((slot) => (
              <div key={slot.id} className="voorbeeld__lesuur">
                {slot.label} {formatSlotTime(slot.start)}–{formatSlotTime(slot.end)}
              </div>
            ))}
          </div>
          <div className="voorbeeld__midden">
            {beeld.titelOn && (
              <div className="voorbeeld__titel">
                {beeld.titel || '1e uur'}
              </div>
            )}
            {beeld.titelOn && beeld.tijdOn && (
              <div className="voorbeeld__tijd">
                {beeld.tijd || '08:30–09:15'}
              </div>
            )}
          </div>
          {beeld.mededelingOn && beeld.mededeling && (
            <div className="voorbeeld__ticker">{beeld.mededeling}</div>
          )}
          <div className="voorbeeld__klok">08:30</div>
        </div>
        <div className="voorbeeld__bijschrift">
          thema: {beeld.thema ?? 'auto'} · seizoen: {beeld.seizoen ?? 'auto'} ·
          weer: {beeld.weer ?? 'auto'} · feest: {beeld.feest ?? 'auto'} ·
          snelheid: {String(beeld.snelheid ?? 1)}x · grootte: {String(beeld.grootte ?? 1)}x
          {!beeld.lesurenOn && ' · lesuren uit'}
          {!beeld.overgangOn && ' · overgang uit'}
        </div>
      </div>

      <label className="admin__row">
        <span>titel</span>
        <input
          value={beeld.titel ?? ''}
          placeholder="auto (rooster)"
          onChange={(event) => set({ titel: event.target.value, titelOn: true })}
        />
        <select
          value={beeld.titelOn ? 'aan' : 'uit'}
          onChange={(event) => set({ titelOn: event.target.value === 'aan' })}
        >
          <option value="aan">aan</option>
          <option value="uit">uit</option>
        </select>
      </label>

      <label className="admin__row">
        <span>tijd</span>
        <input
          value={beeld.tijd ?? ''}
          placeholder="auto (rooster)"
          onChange={(event) => set({ tijd: event.target.value, tijdOn: true })}
        />
        <select
          value={beeld.tijdOn ? 'aan' : 'uit'}
          onChange={(event) => set({ tijdOn: event.target.value === 'aan' })}
        >
          <option value="aan">aan</option>
          <option value="uit">uit</option>
        </select>
      </label>

      <label className="admin__row">
        <span>mededeling</span>
        <input
          value={beeld.mededeling ?? ''}
          placeholder="scrollende tekst onderaan"
          onChange={(event) => set({ mededeling: event.target.value, mededelingOn: true })}
        />
        <select
          value={beeld.mededelingOn ? 'aan' : 'uit'}
          onChange={(event) => set({ mededelingOn: event.target.value === 'aan' })}
        >
          <option value="aan">aan</option>
          <option value="uit">uit</option>
        </select>
      </label>

      <label className="admin__row">
        <span>thema</span>
        <select
          value={beeld.thema ?? 'auto'}
          onChange={(event) => set({ thema: event.target.value })}
        >
          <option value="auto">auto (rooster)</option>
          <option value="uit">uit</option>
          {ARTWORK_MODE_IDS.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </label>

      <label className="admin__row">
        <span>seizoen</span>
        <select
          value={beeld.seizoen ?? 'auto'}
          onChange={(event) => set({ seizoen: event.target.value })}
        >
          <option value="auto">auto</option>
          <option value="uit">uit</option>
          {SEASONS.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </label>

      <label className="admin__row">
        <span>weer</span>
        <select
          value={beeld.weer ?? 'auto'}
          onChange={(event) => set({ weer: event.target.value })}
        >
          <option value="auto">auto</option>
          <option value="regen">regen</option>
          <option value="sneeuw">sneeuw</option>
          <option value="uit">uit</option>
        </select>
      </label>

      <label className="admin__row">
        <span>feest</span>
        <select
          value={beeld.feest ?? 'auto'}
          onChange={(event) => set({ feest: event.target.value })}
        >
          <option value="auto">auto</option>
          <option value="uit">uit</option>
          {HOLIDAY_IDS.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </label>

      <label className="admin__row">
        <span>snelheid</span>
        <select
          value={String(beeld.snelheid ?? 1)}
          onChange={(event) => set({ snelheid: Number(event.target.value) })}
        >
          {SPEEDS.map((value) => (
            <option key={value} value={value}>{value}x</option>
          ))}
        </select>
      </label>

      <label className="admin__row">
        <span>grootte</span>
        <select
          value={String(beeld.grootte ?? 1)}
          onChange={(event) => set({ grootte: Number(event.target.value) })}
        >
          {SIZE_SCALES.map((value) => (
            <option key={value} value={value}>{value}x</option>
          ))}
        </select>
      </label>

      <label className="admin__row">
        <span>lesuren</span>
        <select
          value={beeld.lesurenOn ? 'aan' : 'uit'}
          onChange={(event) => set({ lesurenOn: event.target.value === 'aan' })}
        >
          <option value="aan">aan</option>
          <option value="uit">uit</option>
        </select>
      </label>

      <label className="admin__row">
        <span>overgang</span>
        <select
          value={beeld.overgangOn ? 'aan' : 'uit'}
          onChange={(event) => set({ overgangOn: event.target.value === 'aan' })}
        >
          <option value="aan">aan</option>
          <option value="uit">uit</option>
        </select>
      </label>

      <div className="admin__row">
        <button type="button" className="admin__verstuur" onClick={() => stuur()}>
          Verstuur naar het scherm
        </button>
        <button type="button" onClick={() => stuur(leeg)}>Reset alles</button>
      </div>

      <p className="admin__status">{status}</p>
    </main>
  );
};
