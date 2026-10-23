// ============================================================
// Reference Number Service – Auto-incrementing Ref Numbers
// ============================================================
import { db, generateId } from '../store/db';
import type { ReferenceSequence } from '../types';

export async function generateReferenceNumber(
  companyId: string,
  category: string,
  customPrefix?: string,
): Promise<string> {
  const currentYear = new Date().getFullYear();
  const catCode = getCategoryCode(category);
  const prefix = customPrefix || catCode;

  return await db.transaction('rw', db.referenceSequences, async () => {
    let seq = await db.referenceSequences
      .where('companyId')
      .equals(companyId)
      .and((s) => s.prefix === prefix)
      .first();

    if (!seq) {
      seq = {
        id: generateId(),
        companyId,
        prefix,
        currentNumber: 1,
        format: '{prefix}/{YYYY}/{SEQ:4}',
        fiscalYearStart: 4,
        lastReset: new Date().toISOString(),
      };
      await db.referenceSequences.add(seq);
      return formatRef(prefix, currentYear, 1);
    }

    const nextNumber = seq.currentNumber + 1;
    await db.referenceSequences.update(seq.id, {
      currentNumber: nextNumber,
      lastReset: new Date().toISOString(),
    });

    return formatRef(prefix, currentYear, nextNumber);
  });
}

function getCategoryCode(category: string): string {
  switch (category) {
    case 'employment_onboarding':
      return 'EMP';
    case 'resignation_separation':
      return 'SEP';
    case 'disciplinary_performance':
      return 'DISC';
    case 'general_hr':
      return 'HR';
    default:
      return 'DOC';
  }
}

function formatRef(prefix: string, year: number, seq: number): string {
  const padded = String(seq).padStart(4, '0');
  return `${prefix}/${year}/${padded}`;
}
