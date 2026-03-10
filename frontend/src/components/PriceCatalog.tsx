import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, ChevronRight, LayoutGrid, Gamepad2, CreditCard, Smartphone } from 'lucide-react';

interface Sku {
    id: string;
    name: string;
    normal: number;
    pro: number;
    legend: number;
    supreme: number;
}

interface Product {
    id: string;
    name: string;
    image: string;
    skus: Sku[];
}

interface Category {
    id: string;
    name: string;
    icon: string;
    image: string;
    products: Product[];
}

// --- Sub-components to handle image error state without violating Hook rules ---

const CategoryButton = ({ cat, activeCategoryId, onClick }: { cat: Category, activeCategoryId: string, onClick: (id: string) => void }) => {
    const [imgError, setImgError] = useState(false);

    return (
        <button
            key={cat.id}
            onClick={() => onClick(cat.id)}
            title={cat.name}
            className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden transition-all border-2 ${activeCategoryId === cat.id ? 'bg-white border-indigo-600 shadow-md scale-105' : 'bg-white border-slate-100 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:border-indigo-200'}`}
        >
            {(cat.image || cat.icon) && !imgError ? (
                <img
                    src={cat.image || cat.icon}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <span className="text-xs font-bold text-slate-400">{cat.name.substring(0, 2)}</span>
                </div>
            )}
        </button>
    );
};

const ProductButton = ({ p, selectedProductId, onClick }: { p: Product, selectedProductId: string | null, onClick: (id: string) => void }) => {
    const [imgError, setImgError] = useState(false);

    return (
        <button
            key={p.id}
            onClick={() => onClick(p.id)}
            className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all w-24 shrink-0 border ${selectedProductId === p.id ? 'bg-white/10 border-indigo-500/50 shadow-inner' : 'border-transparent hover:bg-white/5'}`}
        >
            <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg flex items-center justify-center bg-slate-800 border border-white/5">
                {p.image && !imgError ? (
                    <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <span className="text-xl font-black text-indigo-500/50 uppercase">{p.name.substring(0, 2)}</span>
                )}
            </div>
            <span className={`text-[10px] font-bold text-center leading-tight truncate w-full ${selectedProductId === p.id ? 'text-indigo-400' : 'text-slate-400'}`}>
                {p.name}
            </span>
        </button>
    );
};

const PriceCatalog = () => {
    const [catalog, setCatalog] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategoryId, setActiveCategoryId] = useState('all');
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    useEffect(() => {
        fetch('http://localhost:3001/public/products/full-catalog')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCatalog(data);
                    // Auto select first product if available
                    if (data.length > 0 && data[0].products && data[0].products.length > 0) {
                        setSelectedProductId(data[0].products[0].id);
                    }
                } else {
                    console.error("Catalog data is not an array", data);
                    setCatalog([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch catalog", err);
                setLoading(false);
            });
    }, []);

    const filteredCategories = useMemo(() => {
        if (!Array.isArray(catalog)) return [];
        if (activeCategoryId === 'all') return catalog;
        return catalog.filter(c => c.id === activeCategoryId);
    }, [catalog, activeCategoryId]);

    const allProducts = useMemo(() => {
        let products: Product[] = [];
        if (Array.isArray(filteredCategories)) {
            filteredCategories.forEach(cat => {
                if (cat && Array.isArray(cat.products)) {
                    products = [...products, ...cat.products];
                }
            });
        }


        if (searchTerm) {
            products = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return products;
    }, [filteredCategories, searchTerm]);

    const activeProduct = useMemo(() => {
        if (!selectedProductId) return null;
        for (const cat of catalog) {
            const p = cat.products.find(prod => prod.id === selectedProductId);
            if (p) return p;
        }
        return null;
    }, [catalog, selectedProductId]);

    // Format Indonesian Rupiah
    const formatIDR = (num: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(num);
    };

    if (loading) return <div className="text-center py-20 text-slate-400">Memuat Katalog Harga...</div>;

    return (
        <section className="py-20 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <p className="text-indigo-500 font-bold uppercase tracking-widest text-xs mb-3">Harga Modal Termurah</p>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Katalog Harga & Produk</h2>
                <div className="w-20 h-1.5 bg-indigo-500 mx-auto rounded-full"></div>
            </div>

            {/* Filter & Search Bar - Category Icons Horizontal Scroll */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10">
                <div className="w-full md:flex-1 overflow-hidden">
                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar-light min-w-0">
                        <button
                            onClick={() => setActiveCategoryId('all')}
                            title="Semua Produk"
                            className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 ${activeCategoryId === 'all' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
                        >
                            <LayoutGrid className="w-6 h-6" />
                        </button>
                        {catalog.map(cat => (
                            <CategoryButton
                                key={cat.id}
                                cat={cat}
                                activeCategoryId={activeCategoryId}
                                onClick={setActiveCategoryId}
                            />
                        ))}
                    </div>
                </div>

                <div className="relative w-full md:w-80 shrink-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari Game..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-full focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {/* Product Grid / Row - Icons with Text at Bottom */}
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
                <div className="bg-slate-900 p-3 overflow-x-auto custom-scrollbar">
                    <div className="flex gap-4 min-w-max px-2">
                        {allProducts.map(p => (
                            <ProductButton
                                key={p.id}
                                p={p}
                                selectedProductId={selectedProductId}
                                onClick={setSelectedProductId}
                            />
                        ))}
                    </div>
                </div>

                {/* Price Table Area */}
                <div className="p-0">
                    <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex justify-between items-center">
                        <div>
                            <h3 className="text-slate-900 font-black text-lg">Katalog Harga - {activeProduct?.name}</h3>
                            <p className="text-slate-500 text-xs mt-1 italic">Diupdate: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-all">
                            <Download className="w-4 h-4" /> Download PDF
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white text-slate-800 text-[10px] uppercase font-black border-b border-slate-200">
                                <tr>
                                    <th className="px-8 py-4">DENOM</th>
                                    <th className="px-8 py-4 text-center">NORMAL</th>
                                    <th className="px-8 py-4 text-center text-indigo-600 bg-indigo-50/30">PRO</th>
                                    <th className="px-8 py-4 text-center text-purple-600">LEGEND</th>
                                    <th className="px-8 py-4 text-center text-orange-600">SUPREME</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {activeProduct && activeProduct.skus.length > 0 ? (
                                    activeProduct.skus.map(sku => (
                                        <tr key={sku.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-4">
                                                <div className="font-bold text-slate-800 text-sm">{sku.name}</div>
                                                <div className="text-slate-400 text-[10px] font-medium group-hover:text-indigo-400">Instant Process</div>
                                            </td>
                                            <td className="px-8 py-4 text-center text-slate-500 font-medium text-sm">
                                                {formatIDR(sku.normal)}
                                            </td>
                                            <td className="px-8 py-4 text-center text-indigo-600 font-black text-sm bg-indigo-50/10">
                                                {formatIDR(sku.pro)}
                                            </td>
                                            <td className="px-8 py-4 text-center text-purple-600 font-black text-sm">
                                                {formatIDR(sku.legend)}
                                            </td>
                                            <td className="px-8 py-4 text-center text-orange-600 font-black text-sm">
                                                {formatIDR(sku.supreme)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-slate-400 font-medium">
                                            Tidak ada item untuk produk ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.2);
                }
            `}</style>
        </section>
    );
};

export default PriceCatalog;
