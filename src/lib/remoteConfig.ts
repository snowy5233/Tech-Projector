import { firebaseConfig } from './firebase-config';

/**
 * Beeld-opdracht zoals de admin-pagina hem naar Firebase schrijft.
 * `undefined` velden betekenen: geen override, de projector bepaalt het zelf.
 */
export interface RemoteBeeld {
  titel?: string;
  titelOn?: boolean;
  tijd?: string;
  tijdOn?: boolean;
  mededeling?: string;
  mededelingOn?: boolean;
  thema?: string;
  seizoen?: string;
  weer?: string;
  feest?: string;
  snelheid?: number;
  grootte?: number;
  lesurenOn?: boolean;
  overgangOn?: boolean;
}

export const remoteEnabled = (): boolean =>
  typeof firebaseConfig.databaseUrl === 'string' && firebaseConfig.databaseUrl.trim() !== '';

const url = (): string => `${firebaseConfig.databaseUrl.replace(/\/$/, '')}/beeld.json`;

/** Huidige opdracht ophalen; null als er nog niets is gezet. */
export const fetchRemote = async (): Promise<RemoteBeeld | null> => {
  const response = await fetch(`${url()}?t=${Date.now()}`);
  if (!response.ok) return null;
  const data = (await response.json()) as RemoteBeeld | null;
  return data && typeof data === 'object' ? data : null;
};

/** Volledige opdracht wegschrijven (vervangt alles wat er stond). */
export const writeRemote = async (beeld: RemoteBeeld): Promise<void> => {
  const response = await fetch(`${url()}?t=${Date.now()}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(beeld),
  });
  if (!response.ok) throw new Error(`Falende schrijfactie: ${response.status}`);
};
