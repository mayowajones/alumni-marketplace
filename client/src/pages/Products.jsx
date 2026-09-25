import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  // The URL is the source of truth for the current filter — this is what
  // lets a homepage category tile (or a bookmarked/shared link) land the
  // customer directly on a pre-filtered view instead of an empty "All" list.
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const keyword = searchParams.get("keyword") || "";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (keyword) params.keyword = keyword;

    api
      .get("/products", { params })
      .then(({ data }) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, [category, keyword]);

  const setCategory = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("category", value); else next.delete("category");
    setSearchParams(next);
  };

  const setKeyword = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("keyword", value); else next.delete("keyword");
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-forest-dark mb-8">Shop the Marketplace</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search products…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 border border-forest/20 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-forest/20 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-forest-dark/60">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-forest-dark/60">No products match your search.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
