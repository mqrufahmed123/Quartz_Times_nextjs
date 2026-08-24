import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in Indian Rupee (INR) format e.g. ₹1,45,000 or custom currency
 */
export function formatPrice(amount: number, currency: string = 'INR'): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

/**
 * Format date nicely for luxury presentation
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

/**
 * Truncate text cleanly with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (!text || text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}
