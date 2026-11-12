'use client';

import React from 'react';
import { ToWords } from 'to-words';

// Initialize ToWords with your preferred locale and currency options
const toWords = new ToWords({
  localeCode: 'en-IN', // Indian numbering (Rupees/Paise)
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
  },
});

interface AmountInWordsProps {
  amount: number;
  className?: string;
}

export default function AmountInWords({ amount, className = '' }: AmountInWordsProps) {
  let words = '';
  try {
    words = toWords.convert(amount);
  } catch {
    words = 'Invalid amount';
  }

  return (
    <div className={`text-sm text-neutral-800 font-medium whitespace-nowrap mt-3 ${className}`.trim()}>
      <span className="font-semibold text-neutral-950">In words:</span> {words}
    </div>
  );
}
