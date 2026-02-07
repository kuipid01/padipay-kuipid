"use client";

import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Easing, motion } from "framer-motion";
import { LandingBadge } from "@/components/general/landing-badge";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as Easing } },
};

export default function ContactPage() {
    return (
        <section className="relative min-h-screen bg-linear-to-b from-white to-lemon-primary/20 pt-28 pb-20 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] bg-lemon-primary/10 rounded-full blur-3xl opacity-60" />
                <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-main-green/5 rounded-full blur-3xl opacity-60" />
            </div>

            <div className="container relative mx-auto px-4 max-w-6xl z-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="space-y-16"
                >
                    <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto">
                        <LandingBadge label="Get in Touch" text="We're here to help you succeed" />
                        <h1 className="text-4xl md:text-6xl font-black text-main-green mb-6 font-robotoSlab tracking-tight">
                            Let's start a <br /><span className="text-orange-600">conversation</span>
                        </h1>
                        <p className="text-xl text-gray-600 font-medium leading-relaxed">
                            Have questions about our lending infrastructure? Our team is ready to assist you with tailored solutions for your business.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
                        {/* Contact Info Column */}
                        <div className="lg:col-span-5 space-y-10">
                            <motion.div variants={itemVariants} className="space-y-6">
                                <h3 className="text-2xl font-bold text-main-green font-robotoSlab">Contact Information</h3>
                                <div className="space-y-4">
                                    <ContactCard
                                        icon={<Mail className="text-main-green" size={20} />}
                                        title="Email us"
                                        detail="support@padiloan.com"
                                        subDetail="Expect a response within 24 hours"
                                    />
                                    <ContactCard
                                        icon={<Phone className="text-main-green" size={20} />}
                                        title="Call us"
                                        detail="+234 (0) 800-PADI-LOAN"
                                        subDetail="Mon-Fri from 8am to 5pm"
                                    />
                                    <ContactCard
                                        icon={<MapPin className="text-main-green" size={20} />}
                                        title="Visit us"
                                        detail="Lagos, Nigeria"
                                        subDetail="Lekki Phase 1, Victoria Island"
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="p-8 rounded-3xl bg-main-green text-white space-y-4 shadow-xl">
                                <Clock className="text-lemon-primary mb-2" size={32} />
                                <h4 className="text-xl font-bold">Business Hours</h4>
                                <div className="space-y-2 opacity-90 font-medium">
                                    <p className="flex justify-between"><span>Monday - Friday</span> <span>8:00 AM - 6:00 PM</span></p>
                                    <p className="flex justify-between"><span>Saturday</span> <span>10:00 AM - 2:00 PM</span></p>
                                    <p className="flex justify-between text-lemon-primary/80"><span>Sunday</span> <span>Closed</span></p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Form Column */}
                        <motion.div variants={itemVariants} className="lg:col-span-7">
                            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-lemon-primary/20 border border-gray-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-lemon-primary/10 rounded-bl-full transition-all group-hover:w-28 group-hover:h-28" />

                                <div className="relative space-y-8">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-bold text-main-green font-robotoSlab">Send us a message</h3>
                                        <p className="text-gray-500 font-medium">Fill out the form below and we'll get back to you shortly.</p>
                                    </div>

                                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-main-green ml-1">Full Name</label>
                                                <Input
                                                    placeholder="John Doe"
                                                    className="bg-gray-50/50 border-gray-200 h-14 rounded-2xl focus-visible:ring-lemon-primary focus-visible:border-lemon-primary"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-main-green ml-1">Email Address</label>
                                                <Input
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    className="bg-gray-50/50 border-gray-200 h-14 rounded-2xl focus-visible:ring-lemon-primary focus-visible:border-lemon-primary"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-main-green ml-1">Subject</label>
                                            <Input
                                                placeholder="How can we help?"
                                                className="bg-gray-50/50 border-gray-200 h-14 rounded-2xl focus-visible:ring-lemon-primary focus-visible:border-lemon-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-main-green ml-1">Message</label>
                                            <Textarea
                                                placeholder="Tell us more about your needs..."
                                                className="bg-gray-50/50 border-gray-200 min-h-[180px] rounded-2xl p-4 focus-visible:ring-lemon-primary focus-visible:border-lemon-primary"
                                            />
                                        </div>
                                        <Button className="w-full bg-lemon-primary text-main-green hover:bg-main-green hover:text-white transition-all duration-300 font-black h-16 rounded-2xl text-lg shadow-lg shadow-lemon-primary/30">
                                            Send Message <Send className="ml-2 size-5" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function ContactCard({ icon, title, detail, subDetail }: { icon: React.ReactNode; title: string; detail: string; subDetail?: string }) {
    return (
        <div className="group flex gap-5 p-5 rounded-2xl bg-white/50 border border-gray-100 hover:border-lemon-primary/30 hover:bg-white hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-lemon-primary/20 flex items-center justify-center shrink-0 group-hover:bg-lemon-primary transition-colors">
                {icon}
            </div>
            <div className="py-1">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">{title}</h4>
                <p className="text-lg font-bold text-main-green mb-0.5">{detail}</p>
                {subDetail && <p className="text-sm text-gray-500 font-medium">{subDetail}</p>}
            </div>
        </div>
    );
}

