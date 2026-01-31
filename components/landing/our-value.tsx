import { HandCoins, Users2, LineChart } from "lucide-react";

export function OurValue() {
    const values = [
        {
            icon: <HandCoins className="w-12 h-12 text-primary" />,
            title: "Fair Lending",
            description: "We promote transparent terms and fair interest rates for all borrowers."
        },
        {
            icon: <Users2 className="w-12 h-12 text-primary" />,
            title: "Community Growth",
            description: "Empowering individuals and small businesses with accessible credit."
        },
        {
            icon: <LineChart className="w-12 h-12 text-primary" />,
            title: "Data Driven",
            description: "Providing lenders with insights to make better financial decisions."
        }
    ];

    return (
        <section className="py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4 tracking-tight">Our Core Values</h2>
                    <p className="text-muted-foreground text-lg">The principles that drive every feature we build.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {values.map((v) => (
                        <div key={v.title} className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-lemon-primary/5 rounded-full">{v.icon}</div>
                            <h3 className="text-xl font-bold">{v.title}</h3>
                            <p className="text-muted-foreground">{v.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
