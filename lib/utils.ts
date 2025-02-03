import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import BN from "bn.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: { basisPoints: BN, currency: { symbol: string, decimals: number } }) {
  const lamports = price.basisPoints.toNumber();
  const displayPrice = lamports / Math.pow(10, price.currency.decimals);
  const formattedPrice = displayPrice.toFixed(3);
  return formattedPrice;
}

export function formatCreateAt(createdAt: number) {
  const createdAtMillis = createdAt * 1000;
  const dateObj = new Date(createdAtMillis);
  return dateObj.toLocaleDateString();
}