"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button, Card, ErrorNote, PageHeader, Pagination, inputClass } from "@/components/admin/ui";
import { useResource } from "@/components/admin/useResource";
import { qs } from "@/lib/admin/api";
import { takaEn } from "@/lib/format";

// Server-side search and paging (the shop may grow to 15 to 20 products).
export default function ProductsPage() {
    const [filters, setFilters] = useState({ q: "", status: "all", page: 1 });
    const [search, setSearch] = useState("");
    const list = useResource(`/api/admin/products${qs({ ...filters, limit: 20 })}`);
    const data = list.data;

    return (
        <>
            <PageHeader title="Products" description="Names, photos, packs and prices. Stock is changed on each product's page.">
                <Link href="/admin/products/new" className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700">
                    <Plus aria-hidden className="h-4 w-4" /> New product
                </Link>
            </PageHeader>
            <ErrorNote error={list.error} onRetry={list.reload} />

            <div className="mb-4 flex flex-wrap gap-3">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setFilters((f) => ({ ...f, q: search.trim(), page: 1 }));
                    }}
                    className="flex gap-2"
                >
                    <input
                        type="search"
                        aria-label="Search products"
                        placeholder="Search by name or slug"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`${inputClass} w-64`}
                    />
                    <Button type="submit">Search</Button>
                </form>
                <select
                    aria-label="Show"
                    value={filters.status}
                    onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
                    className={`${inputClass} w-40`}
                >
                    <option value="all">All products</option>
                    <option value="active">On the site</option>
                    <option value="inactive">Hidden</option>
                </select>
            </div>

            <Card className="[&>div]:p-0">
                {!data ? (
                    <p className="p-5 text-sm text-gray-500">{list.loading ? "Loading..." : ""}</p>
                ) : data.products.length === 0 ? (
                    <p className="p-5 text-sm text-gray-500">No products found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[44rem] text-left text-sm">
                            <thead className="border-b border-gray-200 text-xs text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Product</th>
                                    <th className="px-4 py-3 font-medium">Packs</th>
                                    <th className="px-4 py-3 text-right font-medium">From</th>
                                    <th className="px-4 py-3 text-right font-medium">Stock</th>
                                    <th className="px-4 py-3 font-medium">On site</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.products.map((p) => {
                                    const lowest = Math.min(...p.variants.map((v) => v.price));
                                    return (
                                        <tr key={p._id}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
                                                        {p.image ? <img src={p.image} alt="" className="h-full w-full object-contain" /> : null}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">{p.nameBn || p.name}</p>
                                                        <p className="truncate text-xs text-gray-500">
                                                            /{p.slug}
                                                            {p.slug === data.landingProductSlug ? (
                                                                <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-blue-800">Landing page product</span>
                                                            ) : null}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{p.variants.length}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">{Number.isFinite(lowest) ? takaEn(lowest) : "-"}</td>
                                            <td className={`px-4 py-3 text-right tabular-nums ${p.stock <= 10 ? "font-medium text-red-700" : ""}`}>{p.stock}</td>
                                            <td className="px-4 py-3">{p.isActive ? "Yes" : <span className="text-gray-400">Hidden</span>}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Link href={`/admin/products/${p._id}`} className="font-medium text-gray-700 underline underline-offset-2">
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                {data ? (
                    <Pagination page={data.currentPage} totalPages={data.totalPages} total={data.total} onPage={(page) => setFilters((f) => ({ ...f, page }))} />
                ) : null}
            </Card>
        </>
    );
}
