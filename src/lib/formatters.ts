import { AreaUnit, FurnishedStatus, PropertyPurpose, PropertyStatus, PropertyType } from '../types';

export function formatPkr(amount: number, purpose: PropertyPurpose = 'sale'): string {
  if (!Number.isFinite(amount) || amount < 0) return 'PKR 0';

  let formatted: string;
  if (amount >= 10_000_000) {
    const crore = amount / 10_000_000;
    const clean = Number.isInteger(crore) ? crore.toString() : crore.toFixed(2).replace(/\.?0+$/, '');
    formatted = `PKR ${clean} Crore`;
  } else if (amount >= 100_000) {
    const lakh = amount / 100_000;
    const clean = Number.isInteger(lakh) ? lakh.toString() : lakh.toFixed(2).replace(/\.?0+$/, '');
    formatted = `PKR ${clean} Lakh`;
  } else {
    formatted = `PKR ${Math.round(amount).toLocaleString('en-PK')}`;
  }

  return purpose === 'rent' ? `${formatted}/month` : formatted;
}

export function formatArea(value: number, unit: AreaUnit): string {
  const unitLabels: Record<AreaUnit, string> = {
    marla: 'Marla',
    kanal: 'Kanal',
    sq_ft: 'sq ft',
    acre: value === 1 ? 'Acre' : 'Acres',
  };
  const cleanVal = Number.isInteger(value) ? value.toString() : value.toFixed(1).replace(/\.0$/, '');
  return `${cleanVal} ${unitLabels[unit]}`;
}

export function formatStatusLabel(status: PropertyStatus): string {
  switch (status) {
    case 'for_sale':
      return 'For sale';
    case 'for_rent':
      return 'For rent';
    case 'sold':
      return 'Sold';
    case 'rented':
      return 'Rented';
  }
}

export function formatTypeLabel(type: PropertyType): string {
  switch (type) {
    case 'house':
      return 'House';
    case 'plot':
      return 'Plot';
    case 'apartment':
      return 'Apartment';
    case 'shop':
      return 'Shop';
    case 'office':
      return 'Office';
    case 'agricultural_land':
      return 'Agricultural land';
    case 'commercial_building':
      return 'Commercial building';
  }
}

export function formatFurnishedLabel(status: FurnishedStatus): string {
  switch (status) {
    case 'unfurnished':
      return 'Unfurnished';
    case 'semi_furnished':
      return 'Semi-furnished';
    case 'furnished':
      return 'Furnished';
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\[sample listing\]/gi, 'sample')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 140);
}

export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  const digits = whatsappNumber.replace(/[^0-9]/g, '');
  const normalized = digits.startsWith('0') ? `92${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function isSafeHttpOrRelativeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith('/')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function exportInquiriesToCsv(
  rows: Array<{
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    propertyTitle?: string | null;
    sourcePage: string;
    status: string;
    message: string;
    notes?: string | null;
    createdAt: string;
  }>
) {
  const headers = [
    'ID',
    'Date',
    'Name',
    'Phone',
    'Email',
    'Property',
    'Source Page',
    'Status',
    'Message',
    'Notes',
  ];

  const escapeCsv = (value: string | null | undefined) => {
    const raw = (value ?? '').replace(/"/g, '""');
    return `"${raw}"`;
  };

  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        escapeCsv(r.id),
        escapeCsv(r.createdAt),
        escapeCsv(r.name),
        escapeCsv(r.phone),
        escapeCsv(r.email),
        escapeCsv(r.propertyTitle || 'General Inquiry'),
        escapeCsv(r.sourcePage),
        escapeCsv(r.status),
        escapeCsv(r.message),
        escapeCsv(r.notes),
      ].join(',')
    ),
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `al-hashmi-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
