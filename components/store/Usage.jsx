import { toBn } from "@/lib/format";

export default function Usage({ data }) {
    return (
        <section className="paper-grain overflow-hidden">
            <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
                <div>
                    <h2 className="font-display text-4xl font-bold leading-[1.35] text-bon sm:text-5xl sm:leading-[1.3]">
                        {data.title}
                    </h2>
                    <p className="mt-5 max-w-md text-lg text-kali-soft">{data.text}</p>
                    {data.caution ? (
                        <p className="mt-8 max-w-md border-l-4 border-sona pl-4 text-[15px] text-kali-soft">
                            {data.caution}
                        </p>
                    ) : null}
                </div>

                {/* A kobiraj's handwritten slip. The steps are a real
                    sequence, so they are numbered. */}
                <div className="mx-auto w-full max-w-lg rotate-[-1.5deg] bg-[#fbfbf3] px-7 pb-8 pt-7 shadow-[0_1px_0_rgb(0_0_0/0.06),0_24px_40px_-22px_rgb(23_38_26/0.55)] sm:px-9">
                    <div className="flex items-baseline justify-between border-b-2 border-bon pb-3">
                        <p className="font-display text-2xl font-bold text-bon">{data.slipTitle}</p>
                        <p className="font-display text-3xl font-bold text-bon/70" aria-hidden>
                            ℞
                        </p>
                    </div>
                    <ol className="ruled mt-1 font-hand text-[1.45rem] leading-[2.75rem] text-kali">
                        {data.steps?.map((step, i) => (
                            <li key={i} className="flex gap-3">
                                <span className="text-dalchini">{toBn(i + 1)}.</span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ol>
                    {data.signature ? (
                        <p className="mt-6 rotate-[-4deg] text-right font-hand text-2xl text-bon">{data.signature}</p>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
