export const listingConditions = [
  { label: 'New', value: 'NEW' },
  { label: 'Fairly used', value: 'GOOD' },
  { label: 'Worn out', value: 'FAIR' },
  { label: 'Damaged', value: 'POOR' },
] as const;

export const conditionLabels: Record<string, string> = {
  NEW: 'New',
  LIKE_NEW: 'Fairly used',
  GOOD: 'Fairly used',
  FAIR: 'Worn out',
  POOR: 'Damaged',
};
