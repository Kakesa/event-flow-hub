import { Shield, Mail, Phone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const SUPER_ADMIN_NAME = 'ESPOIR KAKESA';
export const SUPER_ADMIN_EMAIL = 'espoirkakesa2@gmail.com';
export const SUPER_ADMIN_PHONES = ['+243858726825', '+243828863897'] as const;

export const USER_AUTHORIZATION_MESSAGE =
  `Votre compte est en attente d'autorisation. Contactez le super admin ${SUPER_ADMIN_NAME} (${SUPER_ADMIN_PHONES.join(' / ')}) pour être autorisé à créer vos événements.`;

export const showUserAuthorizationToast = (toast: {
  info: (title: string, options?: { description?: string; duration?: number }) => void;
}) => {
  toast.info('Compte en attente d\'autorisation', {
    description: USER_AUTHORIZATION_MESSAGE,
    duration: 12000,
  });
};

const UserAuthorizationNotice = () => {
  return (
    <Alert className="mb-6 border-amber-500/40 bg-amber-50 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-50">
      <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-900 dark:text-amber-100">
        Accès limité — autorisation requise
      </AlertTitle>
      <AlertDescription className="text-amber-800 dark:text-amber-200/90 space-y-2">
        <p>
          Bienvenue ! Votre compte a été créé avec le rôle <strong>Utilisateur</strong>.
          Pour créer et gérer vos événements, contactez le super admin{' '}
          <strong>{SUPER_ADMIN_NAME}</strong> afin qu&apos;il vous autorise.
        </p>
        <div className="space-y-1 text-sm">
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0" />
            <a
              href={`mailto:${SUPER_ADMIN_EMAIL}?subject=Demande%20d%27autorisation%20HK%20Event`}
              className="font-medium underline underline-offset-2 hover:text-amber-950 dark:hover:text-amber-50"
            >
              {SUPER_ADMIN_EMAIL}
            </a>
          </p>
          {SUPER_ADMIN_PHONES.map((phone) => (
            <p key={phone} className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <a
                href={`tel:${phone}`}
                className="font-medium underline underline-offset-2 hover:text-amber-950 dark:hover:text-amber-50"
              >
                {phone}
              </a>
            </p>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default UserAuthorizationNotice;
