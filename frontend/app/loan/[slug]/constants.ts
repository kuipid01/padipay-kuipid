import { StepId } from "./types";

export const STEP_ORDER: StepId[] = ['landing', 'phone', 'email', 'passcode', 'bvn', 'bank', 'offer', 'kyc', 'terms', 'processing', 'success', 'credit-score'];

export const NIGERIAN_STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara"
];

export const LGAS_BY_STATE: Record<string, string[]> = {
    "Lagos": ["Ikeja", "Lekki", "Ikorodu", "Badagry", "Epe", "Surulere", "Agege", "Oshodi-Isolo", "Mushin", "Alimosho"],
    "FCT - Abuja": ["Garki", "Wuse", "Maitama", "Asokoro", "Gwarinpa", "Kubwa", "Lugbe", "Bwari", "Kuje"],
    "Rivers": ["Port Harcourt", "Obio-Akpor", "Eleme", "Oyigbo", "Ikwerre", "Bonny", "Ahoada East"],
    "Kano": ["Kano Municipal", "Fagge", "Dala", "Gwale", "Tarauni", "Nassarawa", "Kumbotso"],
    "Oyo": ["Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West"],
};

export const WAGE_RANGES = [
    "Under ₦50,000",
    "₦50,000 - ₦150,000",
    "₦150,001 - ₦300,000",
    "₦300,001 - ₦500,000",
    "₦500,001 - ₦1,000,000",
    "Above ₦1,000,000"
];

export const EMPLOYMENT_TYPES = [
    "Full-time Employee",
    "Part-time Employee",
    "Contractor / Freelancer",
    "Self-Employed / Business Owner",
    "Unemployed",
    "Student",
    "Retired"
];

export const NIGERIAN_BANKS = [
    { name: "Access Bank", slug: "access-bank", color: "#003366", popular: true },
    { name: "Zenith Bank", slug: "zenith-bank", color: "#E02020", popular: true },
    { name: "Guaranty Trust Bank", slug: "gtbank", color: "#F27022", popular: true },
    { name: "First Bank of Nigeria", slug: "first-bank", color: "#113366", popular: true },
    { name: "United Bank for Africa", slug: "uba", color: "#D4001A", popular: true },
    { name: "Kuda Bank", slug: "kuda", color: "#40196D", popular: true },
    { name: "Stanbic IBTC Bank", slug: "stanbic", color: "#0033A0", popular: false },
    { name: "Heritage Bank", slug: "heritage", color: "#004B23", popular: false },
    { name: "Fidelity Bank", slug: "fidelity", color: "#042E6F", popular: false },
    { name: "Union Bank", slug: "union", color: "#00AEEF", popular: false },
    { name: "Wema Bank", slug: "wema", color: "#AF1E2D", popular: false },
    { name: "Sterling Bank", slug: "sterling", color: "#E31837", popular: false },
    { name: "Ecobank Nigeria", slug: "ecobank", color: "#005DAA", popular: false },
    { name: "First City Monument Bank", slug: "fcmb", color: "#502164", popular: false },
    { name: "Opay", slug: "opay", color: "#22CC88", popular: true },
    { name: "PalmPay", slug: "palmpay", color: "#6236FF", popular: true },
];

export const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 50 : -50,
        opacity: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 50 : -50,
        opacity: 0
    })
};
