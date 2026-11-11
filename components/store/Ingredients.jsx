import Photo from "./Photo";

// Bento placements for the featured ingredients, keyed by how many there are.
// The first one always gets the most room. Kept in code because it is layout;
// the dashboard only decides which ingredients are featured.
const BENTO = {
    1: ["lg:col-span-12"],
    2: ["lg:col-span-6", "lg:col-span-6"],
    3: ["lg:col-span-7 lg:row-span-2", "lg:col-span-5", "lg:col-span-5"],
    4: ["lg:col-span-6 lg:row-span-2", "lg:col-span-6", "lg:col-span-3", "lg:col-span-3"],
};

export default function Ingredients({ data }) {
    const items = data.items || [];
    const featured = items.filter((i) => i.featured).slice(0, 4);
    const rest = items.filter((i) => !featured.includes(i));
    const slots = BENTO[featured.length] || [];

    return (
        <section className="bg-bon-deep text-kagoj">
            <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
                <div className="max-w-2xl">
                    <h2 className="font-display text-4xl font-bold leading-[1.35] sm:text-5xl sm:leading-[1.3]">
                        {data.title}
                    </h2>
                    <p className="mt-4 text-lg text-kagoj/75">{data.text}</p>
                </div>

                {featured.length ? (
                    <ul
                        className={`mt-12 grid gap-4 lg:grid-cols-12 lg:gap-5 ${
                            featured.length > 2 ? "lg:grid-rows-[19rem_19rem]" : "lg:grid-rows-[24rem]"
                        }`}
                    >
                        {featured.map((item, i) => (
                            <li
                                key={item.name || i}
                                className={`relative h-[19rem] overflow-hidden sm:h-[22rem] rounded-[1.25rem] lg:h-auto ${slots[i]}`}
                            >
                                <Photo src={item.image} alt={item.name} className="absolute inset-0 h-full w-full" />
                                {/* Specimen label: a paper tag on the photo, so the
                                    text stays readable without a dark overlay. */}
                                <div className="absolute bottom-3 left-3 right-3 max-w-sm rounded-xl bg-kagoj px-4 py-3 text-kali shadow-[0_10px_24px_-12px_rgb(0_0_0/0.6)] sm:right-auto">
                                    <div className="flex flex-wrap items-baseline gap-x-2">
                                        <h3 className="font-display text-2xl font-semibold leading-snug text-bon">{item.name}</h3>
                                        {item.latin ? <span className="text-sm italic text-dalchini">{item.latin}</span> : null}
                                    </div>
                                    <p className="mt-1 text-[15px] leading-snug text-kali-soft">{item.text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : null}

                {rest.length ? (
                    <div className="mt-14">
                        <p className="font-hand text-2xl text-sona-light">আরও যা আছে</p>
                        <ul className="mt-5 grid gap-x-8 gap-y-7 border-t border-kagoj/15 pt-7 sm:grid-cols-2 lg:grid-cols-4">
                            {rest.map((item, i) => (
                                <li key={item.name || i} className="flex gap-4">
                                    <Photo
                                        src={item.image}
                                        alt={item.name}
                                        className="h-16 w-16 shrink-0 rounded-full ring-2 ring-sona/50 ring-offset-2 ring-offset-bon-deep"
                                    />
                                    <div className="min-w-0">
                                        <h3 className="font-display text-xl font-semibold text-sona-light">{item.name}</h3>
                                        {item.latin ? <p className="text-sm italic text-kochi/80">{item.latin}</p> : null}
                                        <p className="mt-1.5 text-[15px] leading-relaxed text-kagoj/75">{item.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
