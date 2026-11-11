import { Plus } from "lucide-react";

export default function Faq({ data }) {
    if (!data.items?.length) return null;
    return (
        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-28">
            <div>
                <h2 className="font-display text-4xl font-bold leading-[1.35] text-bon sm:text-5xl">{data.title}</h2>
                <p className="mt-4 text-lg text-kali-soft">{data.text}</p>
            </div>
            <div className="border-t border-bon/20">
                {data.items.map((item, i) => (
                    <details key={i} className="group border-b border-bon/20">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-xl font-semibold text-kali [&::-webkit-details-marker]:hidden">
                            {item.q}
                            <Plus
                                aria-hidden
                                className="h-5 w-5 shrink-0 text-pata transition-transform group-open:rotate-45"
                            />
                        </summary>
                        <p className="max-w-2xl pb-6 text-[17px] text-kali-soft">{item.a}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}
