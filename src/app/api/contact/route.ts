import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramNotification } from '@/lib/telegram';
import {
  isHorizon,
  HORIZON_BADGES,
  countryFlag,
  countryFromPhone,
  COUNTRY_TIMEZONES,
  AMBIGUOUS_TIMEZONES,
} from '@/lib/leads';
import { site } from '@/config/site';

const normalizePhone = (value?: string) => {
  const raw = (value || '').trim();
  if (!raw) return '';

  if (raw.includes('|')) {
    const [dialCode, _country, digits = ''] = raw.split('|');
    const onlyDigits = digits.replace(/\D/g, '');
    const cleanDialCode = (dialCode || '').replace(/\D/g, '');
    return `${cleanDialCode}${onlyDigits}`;
  }

  return raw.replace(/\D/g, '');
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, phone, email, budget, estimation, message, confidential, type,
      horizon, sourcePage,
    } = body;

    // Champs de qualification : on ne garde que ce qui est exploitable, une
    // valeur douteuse vaut mieux absente qu'inventee.
    const cleanHorizon = isHorizon(horizon) ? horizon : null;
    const cleanSourcePage =
      typeof sourcePage === 'string' && sourcePage.startsWith('/')
        ? sourcePage.slice(0, 200)
        : null;

    // Validation basique
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Nom et téléphone sont requis' },
        { status: 400 }
      );
    }

    const contactType = type === 'seller' ? 'SELLER' : 'BUYER';

    const normalizedPhone = normalizePhone(phone);
    const existingContact = await prisma.contact.findFirst({
      where: {
        type: contactType,
        OR: [{ phoneNormalized: normalizedPhone }, { phone: phone.trim() }],
      },
    });

    const contact = existingContact
      ? await prisma.contact.update({
          where: { id: existingContact.id },
          data: {
            name,
            phone: phone.trim(),
            phoneNormalized: normalizedPhone,
            email: email || null,
            budget: budget || null,
            estimation: estimation || null,
            message: message || null,
            confidential: confidential || false,
            horizon: cleanHorizon,
            // La premiere page d'entree est l'information interessante :
            // on ne l'ecrase pas a la resoumission.
            sourcePage: existingContact.sourcePage ?? cleanSourcePage,
            status: 'NEW',
          },
        })
      : await prisma.contact.create({
          data: {
            name,
            phone: phone.trim(),
            phoneNormalized: normalizedPhone,
            email: email || null,
            type: contactType,
            budget: budget || null,
            estimation: estimation || null,
            message: message || null,
            confidential: confidential || false,
            horizon: cleanHorizon,
            sourcePage: cleanSourcePage,
            status: 'NEW',
          },
        });

    console.log('Nouveau contact sauvegardé:', contact);

    // 🔔 ENVOI DE LA NOTIFICATION TELEGRAM
    const telegramMessage = formatContactMessage(contact);
    await sendTelegramNotification(telegramMessage);

    return NextResponse.json(
      { message: 'Message envoyé avec succès', contact },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors du traitement du formulaire:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

/** Le curseur envoie un montant brut : on le rend lisible dans Telegram. */
function formatAmount(value: string): string {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0
    ? `${numeric.toLocaleString('fr-FR')} MAD`
    : value;
}

/**
 * Heure qu'il est chez le prospect — de quoi eviter d'appeler Montreal a 3 h.
 * Les pays a plusieurs fuseaux sont marques comme approximatifs plutot que
 * d'afficher une heure fausse presentee comme vraie.
 */
function formatLocalTime(country: string | null): string | null {
  if (!country) return null;
  const timeZone = COUNTRY_TIMEZONES[country];
  if (!timeZone) return null;

  try {
    const time = new Date().toLocaleTimeString('fr-FR', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
    });
    const approx = AMBIGUOUS_TIMEZONES.has(country) ? ' (fuseau principal)' : '';
    return `${time} — ${timeZone}${approx}`;
  } catch {
    return null;
  }
}

// Fonction pour formater le message spécifiquement pour vos contacts
function formatContactMessage(contact: any): string {
  const typeText = contact.type === 'SELLER' ? 'VENDEUR' : 'ACHETEUR';
  // Priorite d'appel, lisible d'un coup d'oeil en haut de la notification.
  const horizon: unknown = contact.horizon;
  const priority = isHorizon(horizon)
    ? HORIZON_BADGES[horizon]
    : { emoji: '⚪️', label: null };

  let message = `${priority.emoji} <b>Nouveau ${typeText} — ${site.city}</b>\n`;
  if (priority.label) {
    message += `<i>${priority.label}</i>\n`;
  }
  message += `\n`;

  message += `<b>👤 Nom:</b> ${contact.name}\n`;
  message += `<b>📱 Téléphone:</b> ${contact.phone}\n`;

  // Pays de l'indicatif : rien n'est stocke, on le relit dans le numero.
  const dialCountry = countryFromPhone(contact.phone);
  if (dialCountry) {
    message += `<b>${countryFlag(dialCountry)} Indicatif:</b> ${dialCountry}\n`;
    const localTime = formatLocalTime(dialCountry);
    if (localTime) {
      message += `<b>🕒 Heure sur place:</b> ${localTime}\n`;
    }
  }

  if (contact.email) {
    message += `<b>📧 Email:</b> ${contact.email}\n`;
  }
  
  if (contact.budget) {
    message += `<b>💰 Budget:</b> ${formatAmount(contact.budget)}\n`;
  }
  
  if (contact.estimation) {
    message += `<b>📊 Estimation:</b> ${formatAmount(contact.estimation)}\n`;
  }

  if (contact.sourcePage) {
    message += `<b>🔗 Page d'origine:</b> ${contact.sourcePage}\n`;
  }
  
  if (contact.message) {
    message += `\n<b>💬 Message:</b>\n${contact.message}\n`;
  }
  
  if (contact.confidential) {
    message += `\n🔒 <i>Contact confidentiel</i>\n`;
  }
  
  message += `\n⏰ ${new Date().toLocaleString('fr-FR')}`;
  message += `\n🆔 ID: ${contact.id}`;
  
  return message;
}