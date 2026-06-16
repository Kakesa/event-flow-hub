export interface ServiceItem {
  slug: string;
  script: string;
  title: string;
  shortDescription: string;
  heroImage: string;
  cardImage: string;
  /** Illustration (PNG) — affichage contain au lieu de cover */
  isIllustration?: boolean;
  intro: string;
  features: { title: string; description: string }[];
  steps: { title: string; description: string }[];
  highlight: string;
}

export const SERVICES: ServiceItem[] = [
  {
    slug: 'planification',
    script: 'Organisation',
    title: 'Planification d\'événements',
    shortDescription: 'Créez et configurez votre mariage, gala ou cérémonie en quelques clics.',
    heroImage: '/images/services/planification-hero.jpg',
    cardImage: '/images/services/planification-dashboard.png',
    isIllustration: true,
    intro: 'De la première idée au jour J, HK Event vous accompagne avec une interface claire et élégante. Définissez la date, le lieu, le type d\'événement et invitez votre équipe en toute simplicité.',
    features: [
      { title: 'Tableau de bord intuitif', description: 'Visualisez tous vos événements, statistiques et activités récentes en un coup d\'œil.' },
      { title: 'Multi-événements', description: 'Gérez plusieurs célébrations simultanément : mariage, anniversaire, gala corporate.' },
      { title: 'Personnalisation', description: 'Adaptez les détails, thèmes et informations pratiques pour chaque occasion.' },
      { title: 'Accès mobile', description: 'Organisez depuis votre téléphone, où que vous soyez en Afrique.' },
    ],
    steps: [
      { title: 'Inscrivez-vous', description: 'Créez votre compte gratuit en quelques secondes.' },
      { title: 'Créez l\'événement', description: 'Renseignez date, lieu, type et description de votre célébration.' },
      { title: 'Invitez vos proches', description: 'Importez ou ajoutez vos invités et lancez les invitations.' },
    ],
    highlight: 'Votre événement mérite une organisation aussi raffinée que la cérémonie elle-même.',
  },
  {
    slug: 'invitations',
    script: 'Invitations',
    title: 'Invitations personnalisées',
    shortDescription: 'Des invitations élégantes par e-mail ou WhatsApp, à votre image.',
    heroImage: '/images/gallery/gallery-bride-portrait.png',
    cardImage: '/images/services/invitations-personnalise.png',
    isIllustration: true,
    intro: 'Choisissez parmi nos modèles raffinés ou personnalisez chaque détail : couleurs, textes, photos. Envoyez vos invitations en masse et suivez leur livraison.',
    features: [
      { title: 'Modèles élégants', description: 'Des designs inspirés des plus belles cérémonies, prêts à personnaliser.' },
      { title: 'E-mail & WhatsApp', description: 'Atteignez vos invités par le canal qu\'ils préfèrent.' },
      { title: 'Envoi en masse', description: 'Invitez des centaines d\'invités en une seule action.' },
      { title: 'Historique complet', description: 'Consultez le statut de chaque invitation envoyée.' },
    ],
    steps: [
      { title: 'Choisissez un modèle', description: 'Parcourez notre galerie de templates d\'invitation.' },
      { title: 'Personnalisez', description: 'Ajoutez vos textes, couleurs et informations pratiques.' },
      { title: 'Envoyez', description: 'Sélectionnez vos invités et lancez l\'envoi instantané.' },
    ],
    highlight: 'Chaque invitation est une promesse d\'un moment inoubliable.',
  },
  {
    slug: 'rsvp',
    script: 'Confirmations',
    title: 'RSVP en ligne',
    shortDescription: 'Suivez les réponses de vos invités en temps réel, sans relances interminables.',
    heroImage: '/images/gallery/gallery-couple-road.png',
    cardImage: '/images/services/rsvp-save-the-date.png',
    isIllustration: true,
    intro: 'Vos invités confirment ou déclinent directement depuis leur invitation. Vous recevez les réponses instantanément et visualisez les statistiques mises à jour en direct.',
    features: [
      { title: 'Lien RSVP unique', description: 'Chaque invité reçoit un lien personnel sécurisé.' },
      { title: 'Statistiques live', description: 'Confirmés, déclinés, en attente : tout est visible en temps réel.' },
      { title: 'Préférences invités', description: 'Recueillez les choix de boissons et informations complémentaires.' },
      { title: 'Rappels automatiques', description: 'Relancez facilement les invités qui n\'ont pas encore répondu.' },
    ],
    steps: [
      { title: 'Envoi de l\'invitation', description: 'L\'invité reçoit son lien RSVP personnalisé.' },
      { title: 'Réponse en un clic', description: 'Confirmation, déclinaison ou message en quelques secondes.' },
      { title: 'Suivi instantané', description: 'Votre tableau de bord se met à jour automatiquement.' },
    ],
    highlight: 'Fini les appels sans fin : vos invités répondent en ligne, vous respirez.',
  },
  {
    slug: 'accueil-qr',
    script: 'Accueil',
    title: 'Scanner QR Code',
    shortDescription: 'Accueillez vos invités avec élégance grâce au scan à l\'entrée.',
    heroImage: '/images/services/accueil-qr-hero.jpg',
    cardImage: '/images/services/scanner-qr.png',
    isIllustration: true,
    intro: 'Chaque invité possède un QR code unique. Le jour de l\'événement, scannez-le à l\'entrée pour valider la présence en un instant et éviter les files d\'attente.',
    features: [
      { title: 'QR unique par invité', description: 'Code généré automatiquement avec chaque invitation.' },
      { title: 'Scan rapide', description: 'Validation en moins d\'une seconde depuis votre mobile.' },
      { title: 'Suivi de présence', description: 'Liste des arrivées mise à jour en temps réel.' },
      { title: 'Mode hors-ligne partiel', description: 'Fonctionne même avec une connexion mobile limitée.' },
    ],
    steps: [
      { title: 'Préparez le jour J', description: 'Ouvrez le scanner depuis votre tableau de bord.' },
      { title: 'Scannez à l\'entrée', description: 'Pointez la caméra vers le QR code de l\'invité.' },
      { title: 'Présence validée', description: 'L\'invité est marqué présent instantanément.' },
    ],
    highlight: 'Un accueil fluide et prestigieux, digne des plus grandes cérémonies.',
  },
  {
    slug: 'livre-d-or',
    script: 'Souvenirs',
    title: 'Livre d\'or digital',
    shortDescription: 'Recueillez les vœux et messages de vos invités en temps réel.',
    heroImage: '/images/gallery/gallery-garden-embrace.png',
    cardImage: '/images/services/livre-dor-card.png',
    isIllustration: true,
    intro: 'Vos invités laissent leurs messages, vœux et anecdotes directement depuis leur invitation. Vous modérez, répondez et conservez ces souvenirs précieux pour toujours.',
    features: [
      { title: 'Messages en direct', description: 'Les vœux apparaissent sur votre espace en temps réel.' },
      { title: 'Modération', description: 'Approuvez ou masquez les messages avant publication.' },
      { title: 'Réponses personnalisées', description: 'Répondez à chaque invité depuis le tableau de bord.' },
      { title: 'Archive durable', description: 'Conservez tous les messages après l\'événement.' },
    ],
    steps: [
      { title: 'Activez le livre d\'or', description: 'Depuis les paramètres de votre événement.' },
      { title: 'Invités écrivent', description: 'Ils laissent un message via leur lien personnel.' },
      { title: 'Vous partagez', description: 'Affichez les plus beaux vœux le jour de la fête.' },
    ],
    highlight: 'Les mots de vos proches, capturés pour l\'éternité.',
  },
  {
    slug: 'analytics',
    script: 'Analyses',
    title: 'Statistiques & analyses',
    shortDescription: 'Visualisez l\'engagement de vos invités avec des tableaux de bord clairs.',
    heroImage: '/images/services/analytics-hero.jpg',
    cardImage: '/images/services/analytics-card.jpg',
    intro: 'Taux de confirmation, préférences boissons, présence le jour J, performance des e-mails : toutes vos données réunies dans des graphiques élégants et faciles à comprendre.',
    features: [
      { title: 'Vue d\'ensemble', description: 'Statistiques globales par événement en un coup d\'œil.' },
      { title: 'Graphiques interactifs', description: 'Courbes, camemberts et barres pour analyser les tendances.' },
      { title: 'Export des données', description: 'Téléchargez vos listes et rapports pour vos archives.' },
      { title: 'Suivi e-mails', description: 'Taux d\'ouverture, livraison et clics sur vos invitations.' },
    ],
    steps: [
      { title: 'Collectez les données', description: 'Chaque action invité alimente vos statistiques.' },
      { title: 'Analysez', description: 'Consultez les graphiques depuis l\'onglet Analytics.' },
      { title: 'Optimisez', description: 'Ajustez votre organisation grâce aux insights.' },
    ],
    highlight: 'Des décisions éclairées pour une célébration parfaite.',
  },
];

export const getServiceBySlug = (slug: string): ServiceItem | undefined =>
  SERVICES.find((s) => s.slug === slug);

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);
