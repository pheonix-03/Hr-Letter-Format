// ============================================================
// Template Engine – HR Letter Generator
// ============================================================
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import type { HRTemplate, TemplateField } from '../types';

dayjs.extend(advancedFormat);

// ---- Placeholder regex ----
const PLACEHOLDER_RE = /\{\{([^#/][^}]*?)\}\}/g;
const CONDITIONAL_IF_RE = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
const CONDITIONAL_UNLESS_RE = /\{\{#unless\s+(\w+)\}\}([\s\S]*?)\{\{\/unless\}\}/g;
const NESTED_CONDITIONAL_IF_RE = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/;
const NESTED_CONDITIONAL_UNLESS_RE = /\{\{#unless\s+(\w+)\}\}([\s\S]*?)\{\{\/unless\}\}/;
const EACH_RE = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

/**
 * Replace all `{{placeholder}}` tokens in `templateContent` with values from `data`.
 * Unknown placeholders are left untouched.
 */
export function fillTemplate(
  templateContent: string,
  data: Record<string, string>,
): string {
  // 1) Process conditional blocks first
  let result = processConditionalBlocks(templateContent, data);

  // 2) Process repeated sections
  result = processRepeatedSections(result, data);

  // 3) Replace simple placeholders
  result = result.replace(PLACEHOLDER_RE, (_match, key: string) => {
    const trimmedKey = key.trim();

    // Handle built-in formatters: {{field | dateFormat:"DD/MM/YYYY"}}
    const pipeIdx = trimmedKey.indexOf('|');
    if (pipeIdx !== -1) {
      const rawField = trimmedKey.slice(0, pipeIdx).trim();
      const formatter = trimmedKey.slice(pipeIdx + 1).trim();
      const rawValue = data[rawField] ?? '';

      if (rawValue) {
        return applyFormatter(rawValue, formatter);
      }
      return '';
    }

    // Simple key lookup
    if (trimmedKey in data) {
      return data[trimmedKey];
    }
    return `{{${key}}}`;
  });

  return result;
}

/**
 * Extract all unique placeholder keys from template content.
 * Returns keys without the surrounding `{{ }}`.
 */
export function extractPlaceholders(content: string): string[] {
  const found = new Set<string>();

  // Simple placeholders
  let match: RegExpExecArray | null;
  const simpleRe = new RegExp(PLACEHOLDER_RE.source, 'g');
  while ((match = simpleRe.exec(content)) !== null) {
    const raw = match[1].trim();
    // If it contains a pipe formatter, take only the field name
    const pipeIdx = raw.indexOf('|');
    found.add(pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw);
  }

  // Conditional blocks expose their field name
  const condIfRe = /\{\{#if\s+(\w+)\}\}/g;
  while ((match = condIfRe.exec(content)) !== null) {
    found.add(match[1].trim());
  }

  const condUnlessRe = /\{\{#unless\s+(\w+)\}\}/g;
  while ((match = condUnlessRe.exec(content)) !== null) {
    found.add(match[1].trim());
  }

  // Each blocks
  const eachRe = /\{\{#each\s+(\w+)\}\}/g;
  while ((match = eachRe.exec(content)) !== null) {
    found.add(match[1].trim());
  }

  return Array.from(found).sort();
}

/**
 * Validate that all required template fields have been provided.
 * Returns an object with `valid`, `missing` (required but empty),
 * and `warnings` (optional notes).
 */
export function validateRequiredFields(
  template: HRTemplate,
  data: Record<string, string>,
): { valid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const field of template.fields) {
    const value = data[field.key];
    const isEmpty = value === undefined || value === null || value.trim() === '';

    // Handle conditional fields: only require if the dependency is met
    if (field.conditional) {
      const depValue = data[field.conditional.dependsOn];
      const conditionMet =
        depValue !== undefined &&
        field.conditional.values.includes(depValue);

      if (!conditionMet) {
        // Condition not met → field not relevant, skip
        continue;
      }
    }

    if (field.required && isEmpty) {
      missing.push(field.label || field.key);
    } else if (!field.required && isEmpty) {
      warnings.push(`Optional field "${field.label || field.key}" is empty.`);
    }

    // Type-specific validation
    if (!isEmpty && value) {
      if (field.type === 'date' && !dayjs(value).isValid()) {
        warnings.push(`"${field.label || field.key}" does not look like a valid date.`);
      }
      if (field.type === 'number' && isNaN(Number(value))) {
        warnings.push(`"${field.label || field.key}" does not look like a valid number.`);
      }
      if (field.type === 'currency' && isNaN(Number(value.replace(/[^0-9.-]/g, '')))) {
        warnings.push(`"${field.label || field.key}" does not look like a valid currency amount.`);
      }
      if (field.type === 'select' && field.options && !field.options.includes(value)) {
        warnings.push(`"${field.label || field.key}" has value "${value}" which is not in the allowed options.`);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Process `{{#if field}}...{{/if}}` and `{{#unless field}}...{{/unless}}` blocks.
 * Supports nesting.
 */
export function processConditionalBlocks(
  content: string,
  data: Record<string, string>,
): string {
  let result = content;
  let maxIterations = 20; // Guard against infinite loops

  // Process from innermost outward by repeatedly replacing until stable
  let changed = true;
  while (changed && maxIterations-- > 0) {
    changed = false;

    // {{#if field}}...{{/if}}
    const prevIf = result;
    result = result.replace(
      NESTED_CONDITIONAL_IF_RE,
      (_match, field: string, body: string) => {
        const value = data[field.trim()];
        const isTruthy = value !== undefined && value !== null && value.trim() !== '' && value.toLowerCase() !== 'false' && value !== '0';
        return isTruthy ? body : '';
      },
    );
    if (result !== prevIf) changed = true;

    // {{#unless field}}...{{/unless}}
    const prevUnless = result;
    result = result.replace(
      NESTED_CONDITIONAL_UNLESS_RE,
      (_match, field: string, body: string) => {
        const value = data[field.trim()];
        const isTruthy = value !== undefined && value !== null && value.trim() !== '' && value.toLowerCase() !== 'false' && value !== '0';
        return isTruthy ? '' : body;
      },
    );
    if (result !== prevUnless) changed = true;
  }

  return result;
}

/**
 * Process `{{#each items}}...{{/each}}` blocks.
 * Data for repeated sections is encoded as JSON arrays in the data record.
 */
export function processRepeatedSections(
  content: string,
  data: Record<string, string>,
): string {
  return content.replace(EACH_RE, (_match, field: string, body: string) => {
    const rawValue = data[field.trim()];
    if (!rawValue) return '';

    try {
      const items: Record<string, string>[] = JSON.parse(rawValue);
      if (!Array.isArray(items)) return '';

      return items
        .map((item, index) => {
          let row = body;
          // Replace {{@index}} with 0-based index
          row = row.replace(/\{\{@index\}\}/g, String(index));
          // Replace {{@number}} with 1-based number
          row = row.replace(/\{\{@number\}\}/g, String(index + 1));
          // Replace {{fieldName}} with item values
          for (const [k, v] of Object.entries(item)) {
            row = row.replace(new RegExp(`\\{\\{${escapeRegex(k)}\\}\\}`, 'g'), v);
          }
          return row;
        })
        .join('');
    } catch {
      // Not valid JSON – treat as empty
      return '';
    }
  });
}

/**
 * Format a date string using dayjs.
 * Accepts common format tokens: DD, MM, YYYY, MMM, MMMM, Do, etc.
 */
export function formatDate(date: string, format: string): string {
  if (!date) return '';
  const parsed = dayjs(date);
  if (!parsed.isValid()) return date;
  return parsed.format(format);
}

/**
 * Format a numeric string as a currency value.
 * @param amount - Raw number string (e.g. "50000")
 * @param currency - Currency code (e.g. "INR", "USD", "EUR")
 */
export function formatCurrency(amount: string, currency: string): string {
  if (!amount) return '';
  const numericValue = parseFloat(amount.replace(/[^0-9.-]/g, ''));
  if (isNaN(numericValue)) return amount;

  const currencyLocaleMap: Record<string, string> = {
    INR: 'en-IN',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    AED: 'ar-AE',
    SGD: 'en-SG',
    AUD: 'en-AU',
    CAD: 'en-CA',
    JPY: 'ja-JP',
    CNY: 'zh-CN',
  };

  const locale = currencyLocaleMap[currency.toUpperCase()] || 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: currency.toUpperCase() === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency.toUpperCase() === 'JPY' ? 0 : 2,
    }).format(numericValue);
  } catch {
    // Fallback if currency code is not supported
    return `${currency} ${numericValue.toLocaleString()}`;
  }
}

/**
 * Convert a number to words (for salary letters, etc.).
 * Supports up to 999,999,999,999 (billions).
 */
export function numberToWords(amount: string): string {
  const num = parseFloat(amount.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return amount;
  if (num === 0) return 'Zero';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertGroup(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertGroup(n % 100) : '');
  }

  const absNum = Math.abs(Math.floor(num));
  const parts: string[] = [];

  const billions = Math.floor(absNum / 1_000_000_000);
  const millions = Math.floor((absNum % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((absNum % 1_000_000) / 1_000);
  const remainder = absNum % 1_000;

  if (billions) parts.push(convertGroup(billions) + ' Billion');
  if (millions) parts.push(convertGroup(millions) + ' Million');
  if (thousands) parts.push(convertGroup(thousands) + ' Thousand');
  if (remainder) parts.push(convertGroup(remainder));

  const integerPart = parts.join(' ') || 'Zero';

  // Handle decimal part (paise/cents)
  const decimalStr = amount.includes('.') ? amount.split('.')[1]?.slice(0, 2) : '';
  if (decimalStr && parseInt(decimalStr) > 0) {
    const paddedDecimal = decimalStr.padEnd(2, '0');
    return `${num < 0 ? 'Minus ' : ''}${integerPart} and ${convertGroup(parseInt(paddedDecimal))} Paise`;
  }

  return `${num < 0 ? 'Minus ' : ''}${integerPart} Only`;
}

/**
 * Build a full data record from employee, company, and custom fields.
 * Merges all sources and adds computed fields.
 */
export function buildTemplateData(
  customData: Record<string, string>,
  employee?: Record<string, string>,
  company?: Record<string, string>,
): Record<string, string> {
  const data: Record<string, string> = {};

  // Add company fields with "company_" prefix
  if (company) {
    for (const [key, value] of Object.entries(company)) {
      if (typeof value === 'string') {
        data[`company_${key}`] = value;
        data[key] = value; // also without prefix for convenience
      }
    }
  }

  // Add employee fields with "employee_" prefix
  if (employee) {
    for (const [key, value] of Object.entries(employee)) {
      if (typeof value === 'string') {
        data[`employee_${key}`] = value;
        data[key] = value; // also without prefix for convenience
      }
    }
  }

  // Custom / form data overrides everything
  for (const [key, value] of Object.entries(customData)) {
    data[key] = value;
  }

  // Add computed fields
  data['current_date'] = dayjs().format('DD/MM/YYYY');
  data['current_date_long'] = dayjs().format('MMMM D, YYYY');
  data['current_date_iso'] = dayjs().toISOString();
  data['current_year'] = dayjs().format('YYYY');
  data['current_month'] = dayjs().format('MMMM');
  data['current_day'] = dayjs().format('dddd');

  // Salary in words if salary is present
  if (data['salary']) {
    data['salary_in_words'] = numberToWords(data['salary']);
  }

  return data;
}

/**
 * Get default field values from template field definitions.
 */
export function getDefaultFieldValues(fields: TemplateField[]): Record<string, string> {
  const defaults: Record<string, string> = {};
  for (const field of fields) {
    if (field.defaultValue) {
      // Process dynamic defaults
      if (field.defaultValue === '{{today}}') {
        defaults[field.key] = dayjs().format('YYYY-MM-DD');
      } else if (field.defaultValue === '{{current_year}}') {
        defaults[field.key] = dayjs().format('YYYY');
      } else {
        defaults[field.key] = field.defaultValue;
      }
    }
  }
  return defaults;
}

// ---- Internal helpers ----

function applyFormatter(value: string, formatter: string): string {
  const trimmed = formatter.trim();

  // dateFormat:"DD/MM/YYYY"
  const dateMatch = trimmed.match(/^dateFormat\s*:\s*"(.+)"$/);
  if (dateMatch) {
    return formatDate(value, dateMatch[1]);
  }

  // currency:"INR"
  const currencyMatch = trimmed.match(/^currency\s*:\s*"(.+)"$/);
  if (currencyMatch) {
    return formatCurrency(value, currencyMatch[1]);
  }

  // uppercase
  if (trimmed === 'uppercase') {
    return value.toUpperCase();
  }

  // lowercase
  if (trimmed === 'lowercase') {
    return value.toLowerCase();
  }

  // titlecase
  if (trimmed === 'titlecase') {
    return value.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // numberToWords
  if (trimmed === 'numberToWords') {
    return numberToWords(value);
  }

  return value;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
