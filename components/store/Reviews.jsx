export default function Reviews({ data }) {
    if (!data.items?.length) return null;
    return (
        <section className="border-t border-bon/10 bg-kagoj-deep">
            <div className="mx-auto max-w-6xl px-5 py-20 lg:py-24">
                <h2 className="font-display text-4xl font-bold leading-[1.35] text-bon sm:text-5xl">{data.title}</h2>
                <p className="mt-4 text-lg text-kali-soft">{data.text}</p>
                <ul className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-3">
                    {data.items.map((item, i) => (
                        <li key={i} className="border-t-2 border-bon pt-5">
                            <p aria-hidden className="font-display text-5xl leading-none text-sona">
                                “
                            </p>
                            <blockquote className="-mt-2 text-[17px] text-kali">{item.text}</blockquote>
                            <p className="mt-4 font-semibold text-bon">
                                {item.name}
                                {item.location ? <span className="font-normal text-kali-soft">, {item.location}</span> : null}
                            </p>
                            {item.isSample ? (
                                <span className="mt-2 inline-block rounded bg-dalchini/15 px-2 py-0.5 text-xs font-medium text-dalchini">
                                    নমুনা, আসল রিভিউ নয়
                                </span>
                            ) : null}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
