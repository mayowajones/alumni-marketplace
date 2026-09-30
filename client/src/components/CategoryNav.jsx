import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const categoryImages = {
  electronics: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  cars: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
  wears: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
  watches: "https://images.unsplash.com/photo-1730757679771-b53e798846cf?auto=format&fit=crop&w=900&q=80",
  perfume: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
  foodstuff: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
  provision: "https://images.unsplash.com/photo-1611059264934-dfc78da7dc26?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODl8fHByb3Zpc2lvbnxlbnwwfHwwfHx8MA%3D%3D",
  trucks: "https://images.unsplash.com/photo-1605559424843-9e4c179362c0?auto=format&fit=crop&w=900&q=80",
};

const CategoryNav = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data));
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-gold-dark">Shop by vibe</p>
          <h2 className="text-3xl font-bold text-forest-dark">Browse by category</h2>
        </div>
        <Link to="/products" className="hidden text-sm font-semibold text-forest-dark hover:text-gold-dark sm:inline">
          Explore all →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {categories.map((c) => (
          <Link
            key={c._id}
            to={`/products?category=${c._id}`}
            className="group relative overflow-hidden rounded-[1.35rem] border border-forest/10 bg-white shadow-[0_12px_30px_rgba(17,32,24,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_40px_rgba(17,32,24,0.12)]"
          >
            <div className="relative h-60 overflow-hidden">
              <img
                src={c.image || categoryImages[c.slug] || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80"}
                alt={c.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/15 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4 text-left text-cream">
              <span className="text-[10px] uppercase tracking-[0.22em] text-gold">Shop now</span>
              <p className="mt-1 text-lg font-bold">{c.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryNav;
