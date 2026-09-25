import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import Hero from "../components/Hero.jsx";
import ProductCard from "../components/ProductCard.jsx";
import CategoryNav from "../components/CategoryNav.jsx";

const featureLinks = [
  { label: "Our story", href: "/our-story", description: "Read the journey, values, and milestones behind Command Ojo '98." },
  { label: "Our community", href: "/our-community", description: "Connect with classmates, events, and alumni activities across the years." },
  { label: "Birthdays", href: "/birthdays", description: "Celebrate key milestones and birthday announcements with the class community." },
  { label: "The gallery", href: "/gallery", description: "See reunion photos, school moments, and happy memories from years gone by." },
  { label: "Where are they now?", href: "/where-are-they-now", description: "Follow the achievements and stories of members across careers and continents." },
  { label: "Forms & Documents", href: "/forms-documents", description: "Access reunion forms, class records, and important alumni documents." },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data.products);
      } catch (err) {
        console.error("Failed to load products:", err.message);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const featuredProducts = products.slice(0, 3);

  return (
    <div>
      <Hero />
      <CategoryNav />

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-gold-dark">Alumni hub</p>
            <h2 className="text-3xl font-bold text-forest-dark">Association features</h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Link
            to="/our-community"
            className="group relative overflow-hidden rounded-[1.5rem] border border-forest/10 bg-white shadow-[0_16px_30px_rgba(17,32,24,0.06)] transition hover:-translate-y-1 hover:shadow-[0_25px_45px_rgba(17,32,24,0.12)]"
          >
            <div className="relative h-52 overflow-hidden">
              <img
                src="https://cdss-ojo-1998.memory-expre-9017.chatgpt.site/photos/together.jpg"
                alt="Command Ojo '98 alumni together"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d372d]/85 via-[#0d372d]/15 to-transparent" />
            </div>
            <div className="p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4ead6] text-xl text-forest-dark">
                ✨
              </div>
              <h3 className="text-xl font-bold text-forest-dark">Our community</h3>
              <p className="mt-3 text-sm leading-7 text-forest-dark/70">
                Connect with classmates, events, and alumni activities across the years.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold-dark group-hover:underline">
                Open section →
              </span>
            </div>
          </Link>

          {featureLinks.filter((item) => item.label !== "Our community").map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="group rounded-[1.5rem] border border-forest/10 bg-white p-5 shadow-[0_16px_30px_rgba(17,32,24,0.06)] transition hover:-translate-y-1 hover:shadow-[0_25px_45px_rgba(17,32,24,0.12)]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4ead6] text-xl text-forest-dark">
                ✨
              </div>
              <h3 className="text-xl font-bold text-forest-dark">{item.label}</h3>
              <p className="mt-3 text-sm leading-7 text-forest-dark/70">{item.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold-dark group-hover:underline">
                Open section →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-gold-dark">Curated picks</p>
            <h2 className="text-3xl font-bold text-forest-dark">Featured collection</h2>
          </div>
          <a href="/products" className="text-sm font-semibold text-gold-dark hover:underline">
            View all →
          </a>
        </div>

        {featuredProducts.length > 0 && (
          <div className="mb-12 grid gap-5 lg:grid-cols-3">
            {featuredProducts.map((product, index) => (
              <div
                key={product._id}
                className={`overflow-hidden rounded-[1.6rem] border border-forest/10 bg-white shadow-[0_18px_40px_rgba(17,32,24,0.08)] ${
                  index === 1 ? "lg:-translate-y-2" : ""
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={product.images?.[0]} alt={product.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101d19]/70 via-[#101d19]/10 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-forest-dark">
                    Featured
                  </span>
                </div>
                <div className="space-y-3 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-dark">
                    {product.category?.name || "Marketplace"}
                  </p>
                  <h3 className="text-xl font-bold text-forest-dark">{product.title}</h3>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-2xl font-bold text-forest-dark">
                      {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(product.price)}
                    </p>
                    <a
                      href={`/products/${product._id}`}
                      className="rounded-full border border-forest/10 bg-[#f7f2ea] px-3 py-1.5 text-sm font-semibold text-forest-dark hover:bg-forest hover:text-cream transition"
                    >
                      View item
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-[2rem] border border-forest/10 bg-[#112018] px-6 py-8 text-cream shadow-[0_30px_60px_rgba(17,32,24,0.14)] md:px-8 md:py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">Built for alumni</p>
              <h3 className="mt-3 text-3xl font-bold text-cream">Find what your network already trusts.</h3>
            </div>
            <a
              href="/products"
              className="inline-flex items-center justify-center rounded-xl bg-gold px-6 py-3.5 font-bold text-forest-dark transition hover:bg-[#e9bd6f]"
            >
              Explore marketplace
            </a>
          </div>
        </div>

        {loading ? (
          <p className="mt-10 text-forest-dark/60">Loading listings…</p>
        ) : products.length === 0 ? (
          <p className="mt-10 text-forest-dark/60">No products published yet — check back soon.</p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
