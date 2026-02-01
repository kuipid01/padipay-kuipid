"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-black text-main-green mb-4">Contact Us</h1>
                <p className="text-xl text-gray-500">We'd love to hear from you. Please reach out with any questions.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-16">
                <div className="space-y-8">
                    <ContactInfo
                        icon={<Mail className="text-main-green" size={24} />}
                        title="Email"
                        detail="support@padiloan.com"
                    />
                    <ContactInfo
                        icon={<Phone className="text-main-green" size={24} />}
                        title="Phone"
                        detail="+234 (0) 800-PADI-LOAN"
                    />
                    <ContactInfo
                        icon={<MapPin className="text-main-green" size={24} />}
                        title="Office"
                        detail="Lagos, Nigeria"
                    />
                </div>

                <form className="space-y-6 bg-gray-50 p-8 rounded-3xl border border-gray-100" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-main-green">Name</label>
                        <Input placeholder="Your name" className="bg-white" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-main-green">Email</label>
                        <Input type="email" placeholder="Your email" className="bg-white" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-main-green">Message</label>
                        <Textarea placeholder="How can we help?" className="bg-white min-h-[150px]" />
                    </div>
                    <Button className="w-full bg-lemon-primary text-main-green hover:bg-lemon-primary/90 font-black h-12 rounded-xl">
                        Send Message
                    </Button>
                </form>
            </div>
        </div>
    );
}

function ContactInfo({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
    return (
        <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-lemon-primary/20 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <h4 className="text-lg font-bold text-main-green">{title}</h4>
                <p className="text-gray-500 font-medium">{detail}</p>
            </div>
        </div>
    );
}
