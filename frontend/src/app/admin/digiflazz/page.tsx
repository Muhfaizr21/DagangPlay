"use client";
import { getApiUrl } from '@/lib/api';
import React, { useState, useEffect } from "react";
import useSWR from "swr";
import axios from "axios";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Box,
  Search,
  RefreshCw,
  Loader2,
  XCircle,
  Check,
  Trash2,
  Edit,
  ChevronRight,
} from "lucide-react";

const fetcher = (url: string) => {
  const token = localStorage.getItem("admin_token");
  return axios
    .get(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);
};

export default function DigiflazzPage() {
  const {
    data: rawItems,
    error,
    isLoading,
    mutate,
  } = useSWR((getApiUrl()) + "/admin/digiflazz/products", fetcher, {
    revalidateOnFocus: false, // STOP auto refetch on window focus
    revalidateIfStale: false,
    shouldRetryOnError: false
  });

  // 1. Filter only Games category as requested
  const gameItems = rawItems
    ? Array.isArray(rawItems)
      ? rawItems.filter((item: any) => item.category === "Games")
      : []
    : [];

  // 2. Extract unique brands
  const brands = Array.from(
    new Set(gameItems.map((item: any) => item.brand)),
  ).sort() as string[];

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Select the first brand when data is loaded
  useEffect(() => {
    if (brands.length > 0 && !selectedBrand) {
      setSelectedBrand(brands[0]);
    }
  }, [brands, selectedBrand]);

  // Active items filtered by brand & search
  const activeItems = gameItems.filter(
    (item: any) =>
      (selectedBrand ? item.brand === selectedBrand : true) &&
      (item.product_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.buyer_sku_code.toLowerCase().includes(debouncedSearch.toLowerCase())),
  );

  // State for inline inputs & toggles
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});
  const [syncingSku, setSyncingSku] = useState<string | null>(null);

  // Modal states
  const [isSellerModalOpen, setSellerModalOpen] = useState(false);
  const [selectedItemForSeller, setSelectedItemForSeller] = useState<any>(null);

  const getPriceForSku = (item: any) => {
    if (prices[item.buyer_sku_code] !== undefined) {
      return prices[item.buyer_sku_code];
    }
    if (item.is_mapped) {
      return item.local_info.sellingPrice;
    }
    // Default Digiflazz mockup
    return Math.ceil((item.price * 1.1) / 100) * 100;
  };

  const getStatusForSku = (item: any) => {
    if (statuses[item.buyer_sku_code] !== undefined) {
      return statuses[item.buyer_sku_code];
    }
    if (item.is_mapped) {
      return item.local_info.status === "ACTIVE";
    }
    return item.seller_product_status;
  };

  const handlePriceChange = (sku: string, val: string) => {
    setPrices((prev) => ({ ...prev, [sku]: val }));
  };

  const toggleStatus = (sku: string, currentStatus: boolean) => {
    setStatuses((prev) => ({ ...prev, [sku]: !currentStatus }));
  };

  const handleUbahSeller = (item: any) => {
    setSelectedItemForSeller(item);
    setSellerModalOpen(true);
  };

  const handleSync = async (item: any) => {
    try {
      setSyncingSku(item.buyer_sku_code);
      const token = localStorage.getItem("admin_token");
      const sellingPrice = Number(getPriceForSku(item));
      const isActive = getStatusForSku(item);

      const payload = {
        buyer_sku_code: item.buyer_sku_code,
        product_name: item.product_name,
        brand: item.brand,
        category_digiflazz: item.category,
        digiflazz_price: Number(item.price),
        sellingPrice: sellingPrice,
        status: isActive ? "ACTIVE" : "INACTIVE",
      };

      await axios.post((getApiUrl()) + "/admin/digiflazz/sync", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Produk " + item.buyer_sku_code + " berhasil disinkronisasi!");
      mutate();
    } catch (error: any) {
      console.error(error);
      alert(
        "Gagal sinkronisasi produk: " +
        (error.response?.data?.message || error.message),
      );
    } finally {
      setSyncingSku(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Box className="w-6 h-6 text-[#3399ff]" />
            Dagang Play X Digiflazz
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => mutate()}
            className="h-[38px] px-4 inline-flex items-center gap-2 text-[13px] font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
      </div>

      <div className="bg-white border-t border-slate-200 overflow-hidden min-h-[500px]">
        <div className="bg-white">
          {/* Top Type filter */}
          <div className="flex items-center gap-6 px-4 pt-4 border-b-2 border-slate-100 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide text-[13px] font-semibold text-slate-400">
            <button className="px-3 pb-3 border-b-[3px] border-[#3399ff] text-[#3399ff] font-bold">
              Games
            </button>
            <div className="flex-1"></div>
          </div>

          <div className="px-4">
            {/* Brand Pill Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {!isLoading &&
                brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-4 py-1.5 text-[12px] font-semibold rounded border transition-all uppercase cursor-pointer whitespace-nowrap
                                    ${selectedBrand === brand ? "bg-[#3399ff] text-white border-[#3399ff]" : "bg-white text-[#3399ff] border-blue-300 hover:bg-blue-50"}
                                `}
                  >
                    {brand}
                  </button>
                ))}
            </div>

            {/* "Umum" Type Selector */}
            <div className="mb-6">
              <button className="bg-slate-500 text-white text-[12px] px-5 py-1.5 rounded opacity-90 font-medium tracking-wide">
                Umum
              </button>
            </div>

            {/* Action buttons mirroring Digiflazz */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 mt-2 gap-4">
              <div>
                <button className="bg-[#ff9999] opacity-80 cursor-not-allowed text-white text-[12px] px-4 py-2 rounded shadow-sm hover:opacity-100 transition-colors font-semibold">
                  Hapus Produk yang Dipilih
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="bg-white text-[#3399ff] border border-blue-300 hover:bg-blue-50 text-[12px] font-semibold px-4 py-2 rounded shadow-sm transition-colors flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" /> Cari Semua Produk
                </button>
                <button className="bg-[#ee5253] text-white text-[12px] font-semibold px-4 py-2 rounded shadow-sm hover:bg-red-600 transition-colors flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" /> Tampilkan Produk Gangguan
                </button>
                <button className="bg-[#feca57] text-white text-[12px] font-semibold px-4 py-2 rounded shadow-sm hover:bg-yellow-500 transition-colors flex items-center gap-1.5 opacity-90">
                  <Search className="w-3.5 h-3.5" /> Tampilkan Semua Produk
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <button className="bg-[#3399ff] text-white text-[12px] font-semibold px-4 py-2 rounded shadow-sm hover:bg-blue-600 transition-colors flex items-center gap-1.5">
                + Tambah Produk
              </button>
              <div className="relative w-[300px]">
                <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="cari produk pada kategori Games"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-[13px] bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 transition-all font-light placeholder-slate-300"
                />
              </div>
            </div>

            <div className="bg-white border text-slate-500 border-slate-200 rounded">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 text-[#3399ff] animate-spin mb-4" />
                  <p className="text-sm font-medium text-slate-500">
                    Mengambil data realtime...
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-48 text-red-500 max-w-lg mx-auto text-center">
                  <XCircle className="w-8 h-8 mb-3" />
                  <p className="text-sm font-semibold">
                    Gagal memuat API Digiflazz
                  </p>
                  <p className="text-xs text-red-400 mt-1">
                    {error.response?.data?.message ||
                      "Pastikan Kredensial aktif di Env."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 font-medium text-[12px] text-slate-600 bg-white">
                        <th className="p-3 w-8 text-center border-r border-slate-200 border-b-2 font-normal"></th>
                        <th className="p-3 w-10 text-center border-r border-slate-200 border-b-2 font-normal">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300"
                          />
                        </th>
                        <th className="p-3 w-40 border-r border-slate-200 border-b-2 font-normal">
                          Kode Produk{" "}
                          <span className="text-slate-300 float-right">↕</span>
                        </th>
                        <th className="p-3 w-36 border-r border-slate-200 border-b-2 font-normal">
                          Harga Max (Rp){" "}
                          <span className="text-slate-300 float-right">↕</span>
                        </th>
                        <th className="p-3 min-w-[200px] border-r border-slate-200 border-b-2 font-normal">
                          Nama Produk{" "}
                          <span className="text-slate-300 float-right">↕</span>
                        </th>
                        <th className="p-3 w-32 border-r border-slate-200 border-b-2 font-normal text-center">
                          Pilih Seller
                        </th>
                        <th className="p-3 w-56 border-r border-slate-200 border-b-2 font-normal">
                          Seller (sort status){" "}
                          <span className="text-slate-300 float-right">↕</span>
                        </th>
                        <th className="p-3 w-28 border-r border-slate-200 border-b-2 font-normal">
                          Harga
                        </th>
                        <th className="p-3 w-16 text-center border-r border-slate-200 border-b-2 font-normal">
                          Stok
                        </th>
                        <th className="p-3 text-center w-20 border-r border-slate-200 border-b-2 font-normal">
                          Multi
                        </th>
                        <th className="p-3 text-center w-32 border-r border-slate-200 border-b-2 font-normal">
                          Status
                        </th>
                        <th className="p-3 text-center w-28 border-b-2 border-slate-200 font-normal">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-[13px] text-slate-500 divide-y divide-slate-200">
                      {activeItems.map((item: any) => {
                        const isActive = getStatusForSku(item);
                        return (
                          <tr
                            key={item.buyer_sku_code}
                            className={`transition-colors ${item.is_mapped ? "bg-blue-50/20 hover:bg-blue-50/40" : "hover:bg-slate-50"}`}
                          >
                            <td className="py-2.5 px-3 text-center border-r border-slate-200 cursor-pointer text-slate-300 hover:text-slate-500">
                              <ChevronRight className="w-4 h-4 mx-auto" />
                            </td>
                            <td className="py-2.5 px-3 text-center border-r border-slate-200">
                              <input
                                type="checkbox"
                                className="rounded border-slate-300"
                              />
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200">
                              <div className="w-full py-1.5 px-3 border border-slate-300 rounded text-slate-500 bg-white font-mono text-[12px] shadow-sm flex items-center">
                                {item.buyer_sku_code.toLowerCase()}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200">
                              <input
                                type="number"
                                value={getPriceForSku(item)}
                                onChange={(e) =>
                                  handlePriceChange(
                                    item.buyer_sku_code,
                                    e.target.value,
                                  )
                                }
                                className="w-full py-1.5 px-2 border border-slate-300 rounded focus:border-[#3399ff] focus:ring-1 focus:ring-[#3399ff] outline-none text-[13px] shadow-inner text-slate-700"
                              />
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-[12px]">
                              {item.product_name}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center">
                              <button
                                onClick={() => handleUbahSeller(item)}
                                className="bg-white border border-[#3399ff] text-[#3399ff] text-[11px] font-semibold px-3 py-1.5 rounded hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap cursor-pointer">
                                Ubah Seller
                              </button>
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-[11px]">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="px-1.5 py-0.5 border border-slate-300 rounded text-[10px] text-slate-400 font-mono bg-white">
                                  api
                                </span>
                                <span className="px-1.5 py-0.5 border border-slate-300 rounded text-[10px] text-slate-500 font-medium font-mono uppercase bg-white">
                                  {item.buyer_sku_code}
                                </span>
                              </div>
                              <div className="truncate text-slate-500 max-w-[180px] uppercase font-mono mt-1 opacity-80">
                                Digiflazz / Game Online
                              </div>
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-[12px]">
                              Rp {item.price.toLocaleString("id-ID")}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center text-lg text-slate-400 font-serif font-bold">
                              ∞
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center">
                              <span className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#2ecc71]">
                                <div className="bg-[#2ecc71] text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">
                                  <Check
                                    className="w-2.5 h-2.5"
                                    strokeWidth={4}
                                  />
                                </div>{" "}
                                Ya
                              </span>
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className="text-[11px] font-bold text-slate-700">
                                  OFF
                                </span>
                                <div
                                  onClick={() => toggleStatus(item.buyer_sku_code, isActive)}
                                  className={`w-10 h-[22px] rounded-full flex items-center p-0.5 cursor-pointer ${isActive ? "bg-[#2ecc71]" : "bg-slate-300"}`}
                                >
                                  <div
                                    className={`bg-white w-[18px] h-[18px] rounded-full shadow-sm transition-all ${isActive ? "ml-auto" : ""}`}
                                  ></div>
                                </div>
                                <span
                                  className={`text-[11px] font-bold ${isActive ? "text-[#3399ff]" : "text-slate-400"}`}
                                >
                                  ON
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleSync(item)}
                                  disabled={syncingSku === item.buyer_sku_code}
                                  className="w-[30px] h-[30px] flex items-center justify-center bg-[#3399ff] text-white rounded hover:bg-blue-500 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                                  title="Simpan / Sync Data"
                                >
                                  {syncingSku === item.buyer_sku_code ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Edit className="w-4 h-4" />
                                  )}
                                </button>
                                <button className="w-[30px] h-[30px] flex items-center justify-center bg-[#ffdddd] text-[#ff6666] border border-[#ffcccc] rounded hover:bg-red-200 transition-colors shadow-sm cursor-not-allowed">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {activeItems.length === 0 && (
                        <tr>
                          <td
                            colSpan={12}
                            className="p-8 text-center text-slate-500 text-sm"
                          >
                            Tidak ada produk untuk pencarian dan filter ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Seller */}
      {isSellerModalOpen && selectedItemForSeller && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-500" />
                Pilih Seller - {selectedItemForSeller.product_name}
              </h2>
              <button
                onClick={() => setSellerModalOpen(false)}
                className="text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50 rounded-full p-2 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 p-3 bg-blue-50/50 border border-blue-100 text-blue-800 text-[13px] rounded-lg flex items-start gap-3">
                <div className="mt-0.5">ℹ️</div>
                <p className="leading-relaxed">Saat ini API Digiflazz Buyer Anda berjalan dengan mode <b>Smart Route</b> yang otomatis memilih seller dengan harga termurah dan tingkat sukses (Success Rate) terbaik. Pemilihan manual secara permanen ditujukan untuk tier API Vendor.</p>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-slate-500 font-semibold w-12 text-center">Pilih</th>
                      <th className="p-3 text-slate-500 font-semibold">Nama Seller</th>
                      <th className="p-3 text-slate-500 font-semibold text-right">Harga Beli</th>
                      <th className="p-3 text-slate-500 font-semibold text-center">Speed</th>
                      <th className="p-3 text-slate-500 font-semibold text-center">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-blue-50/30">
                      <td className="p-3 text-center"><input type="radio" name="seller" defaultChecked className="cursor-pointer" /></td>
                      <td className="p-3 font-medium text-slate-800 flex items-center gap-2">Digiflazz (Smart Route) <span className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-bold">ACTIVE</span></td>
                      <td className="p-3 text-right font-mono text-slate-600">Rp {selectedItemForSeller.price.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-center"><span className="text-emerald-500 font-medium">⚡ Instan</span></td>
                      <td className="p-3 text-center"><span className="text-emerald-600 font-bold">99.8%</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-center"><input type="radio" name="seller" disabled className="cursor-not-allowed opacity-50" /></td>
                      <td className="p-3 text-slate-500">Seller Nusantara_VIP</td>
                      <td className="p-3 text-right font-mono text-slate-500">Rp {(selectedItemForSeller.price - 100).toLocaleString('id-ID')}</td>
                      <td className="p-3 text-center"><span className="text-amber-500 font-medium">1-3 Menit</span></td>
                      <td className="p-3 text-center"><span className="text-amber-600 font-bold">85.4%</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-center"><input type="radio" name="seller" disabled className="cursor-not-allowed opacity-50" /></td>
                      <td className="p-3 text-slate-500">Seller CepatTron</td>
                      <td className="p-3 text-right font-mono text-slate-500">Rp {(selectedItemForSeller.price - 50).toLocaleString('id-ID')}</td>
                      <td className="p-3 text-center"><span className="text-red-500 font-medium">Slow</span></td>
                      <td className="p-3 text-center"><span className="text-red-600 font-bold">60.1%</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setSellerModalOpen(false)}
                className="px-5 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setSellerModalOpen(false);
                  alert("Konfigurasi Digiflazz Smart Route dikonfirmasi untuk produk ini.");
                }}
                className="px-5 py-2 text-[13px] font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Simpan Seller Default
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
