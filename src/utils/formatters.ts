const idrFullFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const intFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const decimalOneFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatIDR(amount: number): string {
  if (amount < 0) {
    return `-${idrFullFormatter.format(Math.abs(amount))}`;
  }
  return idrFullFormatter.format(amount);
}

export function formatIDRCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${decimalOneFormatter.format(abs / 1_000_000_000)} M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${decimalOneFormatter.format(abs / 1_000_000)} Jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${intFormatter.format(Math.round(abs / 1_000))} Rb`;
  }
  return `${sign}Rp ${intFormatter.format(abs)}`;
}

export function formatNumber(n: number): string {
  return intFormatter.format(n);
}

export function formatPercent(n: number): string {
  return `${decimalOneFormatter.format(n)}%`;
}

export function formatIndonesianDate(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  return `${day} ${months[monthIdx] || parts[1]} ${parts[0]}`;
}
