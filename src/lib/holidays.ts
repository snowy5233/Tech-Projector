export type HolidayId =
  | 'nieuwjaar'
  | 'valentijn'
  | 'pasen'
  | 'koningsdag'
  | 'sinterklaas'
  | 'halloween'
  | 'kerst';

export const HOLIDAY_IDS: HolidayId[] = [
  'nieuwjaar',
  'valentijn',
  'pasen',
  'koningsdag',
  'sinterklaas',
  'halloween',
  'kerst',
];

/** Anonymous Gregorian computus — Easter Sunday for the given year. */
const easterSunday = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};

const daysBetween = (a: Date, b: Date): number =>
  Math.round(
    (Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) -
      Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) /
      86400000,
  );

/**
 * Actieve feestdag op een datum, of null. Halloween en Kerst lopen iets ruim
 * zodat het effect ook rond de dag zelf zichtbaar is.
 */
export const holidayOf = (date: Date): HolidayId | null => {
  const month = date.getMonth();
  const day = date.getDate();
  if (month === 0 && day === 1) return 'nieuwjaar';
  if (month === 1 && day === 14) return 'valentijn';
  const fromEaster = daysBetween(date, easterSunday(date.getFullYear()));
  if (fromEaster >= -2 && fromEaster <= 1) return 'pasen';
  if (month === 3 && day === 27) return 'koningsdag';
  if (month === 9 && day >= 30) return 'halloween';
  if (month === 10 && day === 1) return 'halloween';
  if (month === 11 && (day === 5 || day === 6)) return 'sinterklaas';
  if (month === 11 && day >= 24 && day <= 26) return 'kerst';
  return null;
};
