import { Banknote, Leaf, PhoneCall, ShieldCheck, Truck } from "lucide-react";

export const TRUST_ICONS = { cash: Banknote, truck: Truck, phone: PhoneCall, leaf: Leaf, shield: ShieldCheck };

export default function Trust({ data }) {
    if (!data.items?.length) return null;
    return (
        <section className="border-y border-bon/10 bg-kagoj-deep">
            <ul className="mx-auto grid max-w-6xl gap-x-8 gap-y-5 px-5 py-7 sm:grid-cols-3">
                {data.items.map((item, i) => {
                    const Icon = TRUST_ICONS[item.icon] || Leaf;
                    return (
                        <li key={i} className="flex items-center gap-4">
                            <Icon aria-hidden className="h-8 w-8 shrink-0 text-pata" strokeWidth={1.5} />
                            <div className="leading-snug">
                                <p className="text-lg font-semibold text-bon">{item.title}</p>
                                <p className="text-[15px] text-kali-soft">{item.text}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
