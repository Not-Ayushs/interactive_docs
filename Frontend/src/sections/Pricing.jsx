import React from 'react';
import { Link } from 'react-router-dom';
import CapsuleButton from '../components/CapsuleButton.jsx';
import { FiCheck } from 'react-icons/fi';

const PRICING_TIERS = [
    {
        name: 'Starter',
        price: 'INR 0',
        period: 'forever free',
        description: 'Perfect for individuals organizing personal notes and documentation.',
        features: [
            'Up to 5 Collections',
            '50 Document Cards',
            'Full Tiptap Rich Editor',
            'Local Storage Persistence',
            'Standard Support'
        ],
        highlight: false,
        btnLabel: 'Get Started Free',
        btnType: 'outline'
    },
    {
        name: 'Pro',
        price: 'INR 19',
        period: 'per month',
        description: 'Ideal for small teams and professionals needing advanced collaboration.',
        features: [
            'Unlimited Collections',
            'Unlimited Document Cards',
            'Export Collections for AI (.md)',
            'MongoDB Cloud Sync',
            'Dynamic Folder Categorization',
            'Priority Support'
        ],
        highlight: true,
        badge: 'MOST POPULAR',
        btnLabel: 'Start Pro Trial',
        btnType: 'active'
    },
    {
        name: 'Enterprise',
        price: ' INR 59',
        period: 'per month',
        description: 'For growing organizations requiring dedicated SLA and security controls.',
        features: [
            'Everything in Pro',
            'Custom Domain & Branding',
            'Role-Based Access Control',
            'SSO & Advanced Security',
            '99.9% Guaranteed Uptime SLA',
            'Dedicated Account Manager'
        ],
        highlight: false,
        btnLabel: 'Contact Sales',
        btnType: 'outline'
    }
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-16 sm:py-24 px-6 sm:px-10 max-w-7xl mx-auto border-t border-zinc-800/80">
            <div className="text-center mb-10 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
                    <span>PRICING PLANS</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
                    Simple, transparent pricing for every team
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base lg:text-lg mt-4 max-w-2xl mx-auto font-normal">
                    Start free with essential documentation tools. Upgrade whenever you are ready to scale.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
                {PRICING_TIERS.map((tier, idx) => (
                    <div
                        key={idx}
                        className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                            tier.highlight
                                ? 'bg-zinc-900 border-2 border-white shadow-2xl md:scale-105 z-10'
                                : 'bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700'
                        }`}
                    >
                        {tier.badge && (
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-black text-[11px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                                {tier.badge}
                            </div>
                        )}

                        <div>
                            <h3 className="text-white font-bold text-xl mb-2">{tier.name}</h3>
                            <p className="text-zinc-400 text-xs leading-relaxed mb-6 font-normal">
                                {tier.description}
                            </p>

                            <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-zinc-800">
                                <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                                <span className="text-zinc-500 text-xs font-medium">/ {tier.period}</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {tier.features.map((feat, fIdx) => (
                                    <li key={fIdx} className="flex items-center gap-3 text-zinc-300 text-sm font-medium">
                                        <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-white shrink-0">
                                            <FiCheck size={12} />
                                        </div>
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Link to="/app/dashboard" className="w-full">
                            <CapsuleButton
                                label={tier.btnLabel}
                                type={tier.btnType}
                                className="w-full py-3 text-sm font-bold"
                            />
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}
