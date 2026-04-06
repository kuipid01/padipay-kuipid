import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Testimonials() {
    const reviews = [
        {
            name: "Chinwendu Okafor",
            role: "CEO, Winspread Capital",
            text: "MyCashNG has completely transformed our lending operations. The automated card authorization and repayment system have reduced our default rates by over 60%. We can now focus on scaling our portfolio while the system handles the heavy lifting of collections.",
            avatar: "CO",
            image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200&h=200",
            brand: "Winspread"
        },
        {
            name: "Babajide Adeyemi",
            role: "Operations Manager, FastCredit",
            text: "The integration was seamless. Being able to track our entire portfolio's health in real-time gives us the confidence to disburse more loans. The automated SMS reminders and smart analytics are exactly what the Nigerian lending space needs.",
            avatar: "BA",
            image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=200&h=200",
            brand: "FastCredit"
        }
    ];

    return (
        <section className="py-24 bg-[#f1f6ed]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <div className="flex justify-center">
                        <div className="px-4 py-1.5 rounded-full border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white">
                            Testimonials
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-main-green font-robotoSlab max-w-3xl mx-auto leading-tight italic">
                        Empowering Lenders Across Nigeria
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto font-medium text-lg">
                        Join the growing network of lenders who trust MyCashNG to automate their operations, manage risk, and scale their business effortlessly.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {reviews.map((r) => (
                        <div key={r.name} className="p-8 sm:p-10 rounded-[40px] bg-white border border-gray-100 shadow-sm space-y-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="size-8 rounded-full bg-main-green/80 flex items-center justify-center">
                                        <div className="size-4 bg-lemon-primary rounded-tr-xl rounded-bl-xl" />
                                    </div>
                                    <span className="font-black text-xl text-main-green tracking-tight">{r.brand}</span>
                                </div>
                                <p className="text-md font-medium text-gray-500 leading-relaxed italic">
                                    "{r.text}"
                                </p>
                            </div>

                            <div className="flex items-center gap-4 pt-6">
                                <Avatar className="size-14 border-4 border-[#f1f6ed] shadow-sm">
                                    <AvatarImage src={r.image} alt={r.name} className="object-cover" />
                                    <AvatarFallback className="bg-lemon-primary text-main-green font-bold text-sm">{r.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-0.5">
                                    <div className="font-black text-lg text-main-green">{r.name}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{r.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
