import { Check } from "lucide-react";
import Photo from "./Photo";

export default function Benefits({ data }) {
    return (
        <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-28">
            <div className="lg:sticky lg:top-28 lg:self-start">
                <h2 className="font-display text-4xl font-bold leading-[1.35] text-bon sm:text-5xl sm:leading-[1.3]">
                    {data.title}
                </h2>
                <p className="mt-5 max-w-md text-lg text-kali-soft">{data.text}</p>
                <div className="relative mt-10 w-64 max-w-full">
                    <Photo src={data.image} alt="" className="aspect-[4/5] rounded-arch" />
                    {data.handNote ? (
                        <span className="absolute -right-10 bottom-8 rotate-[-5deg] rounded-md bg-kagoj px-3 py-1 font-hand text-xl text-dalchini shadow-[0_6px_14px_-6px_rgb(0_0_0/0.35)]">
                            {data.handNote}
                        </span>
                    ) : null}
                </div>
            </div>

            <ul className="divide-y divide-bon/15 border-y border-bon/15">
                {data.items?.map((item, i) => (
                    <li key={i} className="flex gap-5 py-8">
                        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bon text-kochi">
                            <Check aria-hidden className="h-5 w-5" strokeWidth={2.5} />
                        </span>
                        <div>
                            <h3 className="font-display text-2xl font-semibold leading-snug text-kali">{item.title}</h3>
                            <p className="mt-2 max-w-xl text-[17px] text-kali-soft">{item.text}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
