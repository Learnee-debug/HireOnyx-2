import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function daysAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  if (months === 1) return '1 month ago';
  return `${months} months ago`;
}

export function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => {
    const num = Number(n);
    if (num >= 100000) return '₹' + (num / 100000).toFixed(num % 100000 === 0 ? 0 : 1) + 'L';
    if (num >= 1000) return '₹' + (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'k';
    return '₹' + num.toLocaleString('en-IN');
  };
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max)}`;
}

// Deterministic "match score" from a job ID string — stable across renders
export function stableMatch(id = '') {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return 68 + (hash % 28); // range 68–95
}

// Capitalise job type for display: "full-time" → "Full-time"
export function formatType(type = '') {
  return type.split('-').map((w, i) =>
    i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w
  ).join('-');
}
