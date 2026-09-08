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
            // Une valeur absente ne remplace jamais une valeur connue : le
            // prospect qui repose une question sans redonner son budget ne
            // doit pas le voir disparaitre de sa fiche.
            email: email || existingContact.email,
            budget: budget || existingContact.budget,
            estimation: estimation || existingContact.estimation,
            message: message || existingContact.message,
            confidential: confidential ?? existingContact.confidential,
            horizon: cleanHorizon ?? existingContact.horizon,
            // La premiere page d'entree est l'information interessante :
            // on ne l'ecrase pas a la resoumission.
            sourcePage: existingContact.sourcePage ?? cleanSourcePage,
            // Le suivi ne repart pas de zero : un prospect passe en VISITE qui
            // repose une question reste en VISITE. Seul un lead archive
            // revient dans le circuit, puisqu'il se manifeste a nouveau.
            status: existingContact.status === 'ARCHIVED' ? 'NEW' : existingContact.status,
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

    // Memoire de l'echange. La fiche porte l'etat courant, cette ligne porte
    // ce que le prospect a dit cette fois-ci — elle ne sera jamais modifiee.
    await prisma.contactSubmission.create({
      data: {
        contactId: contact.id,
        message: message || null,
        budget: budget || null,
        estimation: estimation || null,
        horizon: cleanHorizon,
        sourcePage: cleanSourcePage,
      },
    });

    const nombreEnvois = await prisma.contactSubmission.count({
      where: { contactId: contact.id },
    });

    console.log('Nouveau contact sauvegardé:', contact);

    // 🔔 ENVOI DE LA NOTIFICATION TELEGRAM
    const telegramMessage = formatContactMessage(contact, {
      envois: nombreEnvois,
      messageDuJour: message || null,
      sourcePageDuJour: cleanSourcePage,
    });
    const notifie = await sendTelegramNotification(telegramMessage);

    // Telegram tombe : le lead est bien en base, mais personne n'est prevenu
    // et le dashboard n'est pas temps reel. Le CRM devient alors le canal de
    // secours — le prospect remonte en tete, a rappeler aujourd'hui, plutot
    // que de dormir sans que personne le sache.
    if (!notifie) {
      console.error(
        `ALERTE: notification Telegram non delivree pour le contact ${contact.id}`
      );
      if (!contact.nextActionAt) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: { nextActionAt: new Date() },
        });
      }
    }

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
type ContexteEnvoi = {
  envois: number;
  messageDuJour: string | null;
  sourcePageDuJour: string | null;
};

function formatContactMessage(contact: any, contexte: ContexteEnvoi): string {
  const typeText = contact.type === 'SELLER' ? 'VENDEUR' : 'ACHETEUR';
  // Un prospect qui revient est un signal fort : il ne doit pas se lire comme
  // un lead neuf.
  const revient = contexte.envois > 1;
  // Priorite d'appel, lisible d'un coup d'oeil en haut de la notification.
  const horizon: unknown = contact.horizon;
  const priority = isHorizon(horizon)
    ? HORIZON_BADGES[horizon]
    : { emoji: '⚪️', label: null };

  let message = revient
    ? `${priority.emoji} <b>${typeText} QUI REVIENT — ${site.city}</b>\n`
    : `${priority.emoji} <b>Nouveau ${typeText} — ${site.city}</b>\n`;
  if (priority.label) {
    message += `<i>${priority.label}</i>\n`;
  }
  if (revient) {
    message += `<i>${contexte.envois}e demande, statut conserve : ${contact.status}</i>\n`;
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
  if (contexte.sourcePageDuJour && contexte.sourcePageDuJour !== contact.sourcePage) {
    message += `<b>🔗 Page cette fois-ci:</b> ${contexte.sourcePageDuJour}\n`;
  }
  
  const messageAffiche = contexte.messageDuJour || contact.message;
  if (messageAffiche) {
    message += `\n<b>💬 Message:</b>\n${messageAffiche}\n`;
  }
  
  if (contact.confidential) {
    message += `\n🔒 <i>Contact confidentiel</i>\n`;
  }
  
  message += `\n⏰ ${new Date().toLocaleString('fr-FR')}`;
  message += `\n🆔 ID: ${contact.id}`;
  
  return message;
}