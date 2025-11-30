export interface PageSettings {
  size: 'a4' | 'letter' | 'a5';
  orientation: 'portrait' | 'landscape';
  margin: 'narrow' | 'normal' | 'wide';
  columns: 1 | 2 | 3;
}

export const PAGE_SIZES = {
  a4: { w: '210mm', h: '297mm' },
  letter: { w: '216mm', h: '279mm' },
  a5: { w: '148mm', h: '210mm' },
};

export const PAGE_MARGINS = {
  narrow: '12.7mm',
  normal: '25.4mm',
  wide: '50.8mm',
};