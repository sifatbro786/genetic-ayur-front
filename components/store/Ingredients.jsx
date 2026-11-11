import Photo from "./Photo";

export default function Ingredients({ data }) {
    return (
        <section className="bg-bon-deep text-kagoj">
            <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
                <div className="max-w-2xl">
                    <h2 className="font-display text-4xl font-bold leading-[1.35] sm:text-5xl sm:leading-[1.3]">
                        {data.title}
                    </h2>
                    <p className="mt-4 text-lg text-kagoj/75">{data.text}</p>
                </div>

                {/* Even items drop lower on desktop so the row reads as a
                    shelf of jars, not a card grid. */}
                <ul className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
                    {data.items?.map((item, i) => (
                        <li key={i} className={i % 2 ? "lg:translate-y-12" : ""}>
                            <div className="rounded-arch border border-sona/50 p-2">
                                <Photo src={item.image} alt={item.name} className="aspect-[3/4] rounded-arch" />
                            </div>
                            <h3 className="mt-5 font-display text-2xl font-semibold text-sona-light">{item.name}</h3>
                            {item.latin ? <p className="text-sm italic text-kochi/80">{item.latin}</p> : null}
                            <p className="mt-2 text-[16px] leading-relaxed text-kagoj/80">{item.text}</p>
                        </li>
                    ))}
                </ul>
                <div aria-hidden className="hidden h-12 lg:block" />
            </div>
        </section>
    );
}
