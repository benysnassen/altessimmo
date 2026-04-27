/**
 * Affichage : "(+212) 612 - 345 - 678"
 * Préserve le format pipe API : indicatif|pays|chiffres
 */

const chunkTriple = (digits: string): string[] => {
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 3) {
    parts.push(digits.slice(i, Math.min(i + 3, digits.length)));
  }
  return parts;
};

/** Chiffres pour href tel: (E.164 sans + dans la valeur, on préfixe + dans l’URL) */
export function phoneInternationalDigits(raw: string | null | undefined): string {
  if (!raw?.trim()) return '';
  const t = raw.trim();

  if (t.includes('|')) {
    const [dial, , digits] = t.split('|');
    const c = (dial || '').replace(/\D/g, '');
    const n = (digits || '').replace(/\D/g, '');
    return `${c}${n}`;
  }

  const d = t.replace(/\D/g, '');
  if (!d) return '';

  if (d.startsWith('212') && d.length >= 11) return d;
  if (d.length === 10 && d.startsWith('0')) return `212${d.slice(1)}`;
  if (d.length === 9 && /^[67]\d{8}$/.test(d)) return `212${d}`;

  return d;
}

export function formatPhoneDisplay(raw: string | null | undefined): string {
  if (!raw?.trim()) return '—';
  const t = raw.trim();

  let country = '';
  let national = '';

  if (t.includes('|')) {
    const [dial, , digits] = t.split('|');
    country = (dial || '').replace(/\D/g, '').replace(/^\+/, '');
    national = (digits || '').replace(/\D/g, '');
  } else {
    const d = t.replace(/\D/g, '');
    if (!d) return raw;

    if (d.startsWith('212') && d.length >= 11) {
      country = '212';
      national = d.slice(3);
    } else if (d.length === 10 && d.startsWith('0')) {
      country = '212';
      national = d.slice(1);
    } else if (d.length === 9 && /^[67]\d{8}$/.test(d)) {
      country = '212';
      national = d;
    } else {
      return chunkTriple(d).join(' - ');
    }
  }

  if (!country || !national) return raw;

  const body = chunkTriple(national).join(' - ');
  return `(+${country}) ${body}`;
}
