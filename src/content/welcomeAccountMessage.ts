export const PRIMARY_WHATSAPP = {
  display: '+243 828 863 897',
  wa: '243828863897',
  label: 'Contacter sur WhatsApp',
} as const;

export const SECONDARY_WHATSAPP = {
  display: '+243 858 726 825',
  wa: '243858726825',
} as const;

export const WELCOME_SUPPORT_PHONES = [PRIMARY_WHATSAPP, SECONDARY_WHATSAPP] as const;

export const WELCOME_ACCOUNT_FEATURES = [
  'Recevoir vos invitations instantanément.',
  'Confirmer votre présence (RSVP).',
  'Présenter votre QR Code à l\'entrée des événements.',
  'Suivre tous vos événements en un seul endroit.',
] as const;

export const WELCOME_ACCOUNT_SESSION_KEY = 'hk_event_show_welcome';
export const WELCOME_WHATSAPP_CONTACTED_PREFIX = 'hk_event_welcome_whatsapp_contacted_';

export function getWelcomeContactStorageKey(userId: string): string {
  return `${WELCOME_WHATSAPP_CONTACTED_PREFIX}${userId}`;
}

export function hasConfirmedWelcomeWhatsApp(userId: string | undefined): boolean {
  if (!userId) return false;
  return localStorage.getItem(getWelcomeContactStorageKey(userId)) === '1';
}

export function markWelcomeWhatsAppContacted(userId: string): void {
  localStorage.setItem(getWelcomeContactStorageKey(userId), '1');
}

export function buildWelcomeWhatsAppMessage(userName: string): string {
  return `Bonjour, je viens de m'inscrire sur HK Events (${userName}). Je souhaite activer les permissions de mon compte.`;
}

export function buildWelcomeAccountGreeting(name: string): string {
  const firstName = String(name || '').trim().split(/\s+/)[0] || 'cher client';
  return `Bonjour ${firstName} 👋`;
}

export function buildWelcomeAccountMessage(name: string): string {
  const greeting = buildWelcomeAccountGreeting(name);
  const phones = WELCOME_SUPPORT_PHONES.map((p) => `📞 ${p.display}`).join('\n');

  return [
    greeting,
    '',
    '🎉 Félicitations !',
    '',
    'Votre inscription sur HK Events est confirmée avec succès.',
    '',
    'Vous êtes désormais prêt(e) à vivre une nouvelle expérience dans la gestion de vos événements.',
    '',
    'Avec HK Events, vous pouvez :',
    ...WELCOME_ACCOUNT_FEATURES.map((f) => `✅ ${f}`),
    '',
    '🔐 Pour obtenir les autorisations nécessaires à l\'utilisation complète de votre compte, veuillez nous contacter directement sur WhatsApp :',
    '',
    `📞 ${PRIMARY_WHATSAPP.display}`,
    `📞 ${SECONDARY_WHATSAPP.display}`,
    '',
    'Notre équipe activera les permissions correspondant à votre profil.',
    '',
    'Merci de faire confiance à HK Events. Nous vous souhaitons une excellente expérience !',
  ].join('\n');
}

/** Corps Meta WhatsApp (variable {{1}} = prénom ou nom). */
export function buildWhatsAppWelcomeTemplateBody(namePlaceholder = '{{1}}'): string {
  return buildWelcomeAccountMessage(namePlaceholder);
}
