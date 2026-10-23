import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'How long does delivery usually take?',
    a: 'Orders placed on business days before 2 PM EST are dispatched within 24 hours. Standard Express delivery takes 2 to 4 business days depending on your postal destination.',
  },
  {
    q: 'What is your return policy?',
    a: 'We offer a 30-day money-back guarantee. If you are not satisfied with your purchase, you can initiate a return through your customer dashboard as long as the item is in its original box with all accessories.',
  },
  {
    q: 'Are all products authentic with warranty?',
    a: 'Yes, 100% of our products are brand new, sealed, and sourced directly from verified manufacturer distributors (e.g. Apple, Sony, Nike, Samsung). Every purchase includes full factory warranty support.',
  },
  {
    q: 'How does the coupon code work?',
    a: 'You can apply any valid coupon (e.g. NOVAFIRST or SAVE20) directly in your cart or during checkout. Discounts will be calculated instantly against eligible subtotals.',
  },
  {
    q: 'Do you offer Cash on Delivery?',
    a: 'Yes, we provide Cash on Delivery (COD) as well as secure 256-bit encrypted credit and debit card processing.',
  },
];

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
          Frequently Asked Questions
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Got Questions? We Have Answers.
        </h1>
        <p className="text-xs text-gray-500">
          Find answers regarding payments, warranties, tracking, and order cancellations.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm transition"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between text-xs font-bold text-gray-900 hover:text-emerald-600 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQ;
