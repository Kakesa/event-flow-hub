import type { SubscriptionType } from '@/types/models';

export interface PlanDefinition {
  id: SubscriptionType;
  label: string;
  price: number;
  maxEvents: number | null;
  maxGuests: number | null;
  features: string[];
  customizableTemplates: boolean;
  advancedAnalytics: boolean;
  basicEmail: boolean;
  emailSupport: boolean;
  prioritySupport: boolean;
  /** Plan visible à l'achat / upgrade */
  sellable: boolean;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionType, PlanDefinition> = {
  free: {
    id: 'free',
    label: 'Free',
    price: 0,
    maxEvents: 1,
    maxGuests: 10,
    features: ['1 événement', '10 invités', 'Emails basiques'],
    customizableTemplates: false,
    advancedAnalytics: false,
    basicEmail: true,
    emailSupport: false,
    prioritySupport: false,
    sellable: true,
  },
  basic: {
    id: 'basic',
    label: 'Basic',
    price: 0,
    maxEvents: 1,
    maxGuests: 10,
    features: ['Plan legacy — migrer vers Premium'],
    customizableTemplates: false,
    advancedAnalytics: false,
    basicEmail: true,
    emailSupport: false,
    prioritySupport: false,
    sellable: false,
  },
  premium: {
    id: 'premium',
    label: 'Premium',
    price: 79,
    maxEvents: 1,
    maxGuests: 200,
    features: [
      '1 événement',
      '200 invités',
      'Templates personnalisés',
      'Analytics avancés',
      'Support email',
    ],
    customizableTemplates: true,
    advancedAnalytics: true,
    basicEmail: true,
    emailSupport: true,
    prioritySupport: false,
    sellable: true,
  },
  enterprise: {
    id: 'enterprise',
    label: 'Enterprise',
    price: 149,
    maxEvents: null,
    maxGuests: null,
    features: [
      'Événements illimités',
      'Invités illimités',
      'Analytics avancés',
      'Support prioritaire',
    ],
    customizableTemplates: true,
    advancedAnalytics: true,
    basicEmail: true,
    emailSupport: true,
    prioritySupport: true,
    sellable: true,
  },
};

export const SELLABLE_PLANS: SubscriptionType[] = ['free', 'premium', 'enterprise'];

export const PAYABLE_PLANS: SubscriptionType[] = ['premium', 'enterprise'];

export function getPlanDefinition(plan?: SubscriptionType | null): PlanDefinition {
  return SUBSCRIPTION_PLANS[plan || 'free'] ?? SUBSCRIPTION_PLANS.free;
}

export function getPlanPrice(plan?: SubscriptionType | null): number {
  return getPlanDefinition(plan).price;
}

export function formatPlanLimit(value: number | null): string {
  return value === null ? '∞' : String(value);
}

export function calculateSubscriptionMRR(counts: Record<SubscriptionType, number>): number {
  return (
    counts.basic * SUBSCRIPTION_PLANS.basic.price +
    counts.premium * SUBSCRIPTION_PLANS.premium.price +
    counts.enterprise * SUBSCRIPTION_PLANS.enterprise.price
  );
}

export function hasAdvancedAnalytics(plan?: SubscriptionType | null): boolean {
  return getPlanDefinition(plan).advancedAnalytics;
}

export function hasCustomTemplates(plan?: SubscriptionType | null): boolean {
  return getPlanDefinition(plan).customizableTemplates;
}
