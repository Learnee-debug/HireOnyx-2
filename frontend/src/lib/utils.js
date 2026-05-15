import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function daysAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
  if (min && max) return `${fmt(min)} – ${fmt(max)} / month`;
  if (min) return `From ${fmt(min)} / month`;
  return `Up to ${fmt(max)} / month`;
}

// Deterministic "match score" from a job ID string — stable across renders
export function stableMatch(id = '') {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return 68 + (hash % 28); // range 68–95
}

// Capitalise job type for display
export function formatType(type = '') {
  return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
}
