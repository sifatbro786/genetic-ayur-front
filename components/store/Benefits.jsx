import { Check } from "lucide-react";
import Photo from "./Photo";

export default function Benefits({ data }) {
    return (
        <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-28">
            <div className="lg:sticky lg:top-28 lg:self-start">
                <h2 className="font-display text-4xl font-bold leading-[1.35] text-bon sm:text-5xl sm:leading-[1.3]">
                    {data.title}
                </h2>
                <p className="mt-5 max-w-md whitespace-pre-line text-lg text-kali-soft">{data.text}</p>
                {/* A photo print on paper with a handwritten caption. The arch
                    shape is kept for the hero only. */}
                <figure className="mt-10 w-72 max-w-full rotate-[2.5deg] bg-[#fbfbf3] p-3 pb-4 shadow-[0_1px_0_rgb(0_0_0/0.05),0_22px_40px_-20px_rgb(23_38_26/0.55)]">
                    <Photo src={data.image} alt="" className="aspect-[4/5] rounded-[3px]" />
                    {data.handNote ? (
                        <figcaption className="mt-3 text-center font-hand text-2xl text-dalchini">{data.handNote}</figcaption>
                    ) : null}
                </figure>
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
