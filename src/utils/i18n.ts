/**
 * Utility for getting localized fields from data objects.
 * Standardizes the 'fieldZh' fallback pattern.
 */
export const getLocalized = <T extends object>(
  obj: T | undefined | null,
  field: string,
  lang: string
): string => {
  if (!obj) return '';
  
  const localizedField = lang === 'zh' ? `${field}Zh` : field;
  const value = (obj as any)[localizedField] || (obj as any)[field];
  
  return typeof value === 'string' ? value : '';
};
