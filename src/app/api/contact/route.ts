import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramNotification } from '@/lib/telegram';

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
    const { name, phone, email, budget, estimation, message, confidential, type } = body;

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

// Fonction pour formater le message spécifiquement pour vos contacts
function formatContactMessage(contact: any): string {
  const typeEmoji = contact.type === 'SELLER' ? '🏠' : '🔍';
  const typeText = contact.type === 'SELLER' ? 'VENDEUR' : 'ACHETEUR';
  
  let message = `${typeEmoji} <b>Nouveau ${typeText}</b>\n\n`;
  
  message += `<b>👤 Nom:</b> ${contact.name}\n`;
  message += `<b>📱 Téléphone:</b> ${contact.phone}\n`;
  
  if (contact.email) {
    message += `<b>📧 Email:</b> ${contact.email}\n`;
  }
  
  if (contact.budget) {
    message += `<b>💰 Budget:</b> ${contact.budget}\n`;
  }
  
  if (contact.estimation) {
    message += `<b>📊 Estimation:</b> ${contact.estimation}\n`;
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