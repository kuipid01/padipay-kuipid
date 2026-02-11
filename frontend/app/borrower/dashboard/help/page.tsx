"use client";

import { HelpCircle, MessageCircle, Mail, Phone, ExternalLink } from "lucide-react";

export default function BorrowerHelpPage() {
    const contacts = [
        { label: "Live Chat", value: "Start a conversation", icon: MessageCircle },
        { label: "Email Support", value: "support@padiloan.com", icon: Mail },
        { label: "Call Center", value: "+234 901 234 5678", icon: Phone },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="size-12 bg-lemon-primary/10 text-main-green rounded-2xl flex items-center justify-center">
                    <HelpCircle size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-main-green">Help & Support</h1>
                    <p className="text-gray-500">How can we assist you today?</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {contacts.map((contact, i) => (
                    <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm text-center">
                        <div className="size-14 bg-gray-50 text-main-green rounded-full flex items-center justify-center mx-auto mb-6">
                            <contact.icon size={28} />
                        </div>
                        <p className="text-sm font-bold text-gray-500 mb-1">{contact.label}</p>
                        <p className="text-lg font-black text-main-green">{contact.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-main-green mb-8">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {[
                        "How do I apply for a loan?",
                        "What is the maximum loan amount?",
                        "How long does disbursement take?",
                        "What are the interest rates?",
                    ].map((q, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl cursor-pointer hover:bg-lemon-primary/10 transition-colors group">
                            <span className="font-bold text-gray-700">{q}</span>
                            <ExternalLink size={18} className="text-gray-400 group-hover:text-main-green" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
