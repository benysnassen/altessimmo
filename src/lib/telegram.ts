// lib/telegram.ts

export async function sendTelegramNotification(message: string) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
  
    if (!botToken || !chatId) {
      console.error('Variables Telegram manquantes');
      return false;
    }
  
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
          }),
        }
      );
  
      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error('Erreur lors de l\'envoi Telegram:', error);
      return false;
    }
  }
  
  // Fonction pour formater joliment les données du formulaire
  export function formatFormData(formData: Record<string, any>): string {
    let message = '🔔 <b>Nouveau formulaire reçu !</b>\n\n';
    
    Object.entries(formData).forEach(([key, value]) => {
      // Formatage du nom de champ (capitalize et remplacer _ par espace)
      const fieldName = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      message += `<b>${fieldName}:</b> ${value}\n`;
    });
    
    message += `\n⏰ ${new Date().toLocaleString('fr-FR')}`;
    
    return message;
  }