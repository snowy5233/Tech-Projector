/**
 * Firebase-configuratie voor het op afstand bedienen van het beeld.
 *
 * Setup (eenmalig, gratis):
 *  1. Ga naar https://console.firebase.google.com en maak een project.
 *  2. Maak een Realtime Database aan (locatie Europa, start in testmodus
 *     of zet de regels op: {"rules": {".read": true, ".write": true}}).
 *  3. Plak hieronder de databaseURL (te vinden bij Realtime Database).
 *     Die ziet er zo uit: https://<project-id>-default-rtdb.europe-west1.firebasedatabase.app
 *  4. Deploy de site — de projector leest en de admin-pagina schrijft.
 *
 * Leeg laten = functie uitgeschakeld; de site werkt dan gewoon lokaal.
 */
export const firebaseConfig = {
  databaseUrl: 'https://tech-projector-default-rtdb.europe-west1.firebasedatabase.app',
};
