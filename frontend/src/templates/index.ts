// ============================================================
// HR Letter Template Library Index & Accessors
// ============================================================
import type { HRTemplate, TemplateCategory } from '../types';
import { employmentOnboardingTemplates } from './employmentOnboarding';
import { resignationSeparationTemplates } from './resignationSeparation';
import { disciplinaryPerformanceTemplates } from './disciplinaryPerformance';
import { generalHRTemplates } from './generalHR';

export const allTemplates: HRTemplate[] = [
  ...employmentOnboardingTemplates,
  ...resignationSeparationTemplates,
  ...disciplinaryPerformanceTemplates,
  ...generalHRTemplates,
];

export function getTemplatesByCategory(category: TemplateCategory): HRTemplate[] {
  return allTemplates.filter((t) => t.category === category);
}

export function getTemplateById(id: string): HRTemplate | undefined {
  return allTemplates.find((t) => t.id === id);
}

export function getTemplateCategories(): { value: TemplateCategory; label: string; count: number }[] {
  return [
    {
      value: 'employment_onboarding',
      label: 'Employment & Onboarding',
      count: employmentOnboardingTemplates.length,
    },
    {
      value: 'resignation_separation',
      label: 'Resignation & Separation',
      count: resignationSeparationTemplates.length,
    },
    {
      value: 'disciplinary_performance',
      label: 'Disciplinary & Performance',
      count: disciplinaryPerformanceTemplates.length,
    },
    {
      value: 'general_hr',
      label: 'General HR & Certificates',
      count: generalHRTemplates.length,
    },
  ];
}

export function searchTemplates(query: string, category?: string): HRTemplate[] {
  let list = allTemplates;
  if (category && category !== 'all') {
    list = list.filter((t) => t.category === category);
  }
  if (!query || query.trim() === '') {
    return list;
  }
  const q = query.toLowerCase().trim();
  return list.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)),
  );
}
