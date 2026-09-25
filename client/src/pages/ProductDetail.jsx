import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";

const formatPrice = (value) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(value);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data));
  }, [id]);

  if (!product) return <p className="mx-auto max-w-7xl px-6 py-12">Loading…</p>;

  const images = product.images?.length ? product.images : ["https://picsum.photos/seed/fallback/800/800"];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[1.8rem] border border-forest/10 bg-white shadow-[0_25px_50px_rgba(17,32,24,0.08)]">
            <img src={images[0]} alt={product.title} className="h-[520px] w-full object-cover" />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {images.slice(0, 3).map((image, index) => (
                <div key={`${image}-${index}`} className="overflow-hidden rounded-[1rem] border border-forest/10 bg-white">
                  <img src={image} alt={`${product.title} view ${index + 1}`} className="h-28 w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[1.8rem] border border-forest/10 bg-white p-6 shadow-[0_25px_50px_rgba(17,32,24,0.08)] md:p-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold-dark">
            {product.category?.name || "Marketplace"}
          </span>

          <h1 className="mt-3 text-3xl font-bold text-forest-dark md:text-4xl">{product.title}</h1>

          <div className="mt-5 flex items-center justify-between gap-4 border-y border-forest/10 py-4">
            <p className="text-3xl font-bold text-forest-dark">{formatPrice(product.price)}</p>
            <span className="rounded-full bg-[#f7f2ea] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-forest-dark/70">
              {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
            </span>
          </div>

          <p className="mt-6 leading-relaxed text-forest-dark/70">{product.description}</p>

          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {Object.entries(product.attributes).map(([key, value]) => (
                <div key={key} className="rounded-xl bg-[#f7f2ea] p-3">
                  <dt className="capitalize text-forest-dark/55">{key}</dt>
                  <dd className="mt-1 font-semibold text-forest-dark">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <p className="mt-6 text-sm text-forest-dark/60">
            Sold on behalf of <strong className="text-forest-dark">{product.memberName}</strong>
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <input
              type="number"
              min="1"
              max={product.stockQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full max-w-[120px] rounded-xl border border-forest/15 bg-[#f7f2ea] px-3 py-3 text-center text-lg font-semibold text-forest-dark outline-none ring-0 focus:border-gold"
            />
            <button
              onClick={() => {
                addItem(product, quantity);
                navigate("/cart");
              }}
              disabled={product.stockQuantity < 1}
              className="flex-1 rounded-xl bg-gold px-6 py-3.5 text-base font-bold text-forest-dark transition hover:bg-[#e9bd6f] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {product.stockQuantity < 1 ? "Out of stock" : "Add to cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
