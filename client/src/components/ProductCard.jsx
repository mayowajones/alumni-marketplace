import React from "react";
import { Link } from "react-router-dom";

const formatPrice = (value) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(value);

const ProductCard = ({ product }) => {
  const outOfStock = product.stockQuantity < 1;

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block overflow-hidden rounded-[1.4rem] border border-forest/10 bg-white shadow-[0_12px_25px_rgba(17,32,24,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(17,32,24,0.12)]"
    >
      <div className="relative aspect-[4/4.15] overflow-hidden bg-[#f4efe6]">
        <img
          src={product.images?.[0]}
          alt={product.title}
          onError={(e) => {
            e.currentTarget.src = "https://picsum.photos/seed/fallback/600/600";
          }}
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
            outOfStock ? "grayscale opacity-60" : ""
          }`}
        />

        {outOfStock ? (
          <span className="absolute left-3 top-3 rounded-full bg-forest-dark px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cream">
            Sold out
          </span>
        ) : (
          <span className="absolute left-3 top-3 rounded-full bg-gold/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-forest-dark">
            New
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-dark">
            {product.category?.name || "Marketplace"}
          </span>
          <span className="rounded-full bg-forest/5 px-2 py-1 text-[10px] font-medium text-forest-dark/70">
            {product.stockQuantity || 0} in stock
          </span>
        </div>

        <h3 className="line-clamp-2 text-base font-bold text-forest-dark leading-snug">
          {product.title}
        </h3>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-forest-dark/45">Price</p>
            <p className="mt-1 text-xl font-bold text-forest-dark">{formatPrice(product.price)}</p>
          </div>
          <span className="rounded-full border border-forest/10 bg-[#f7f2ea] px-2.5 py-1 text-[11px] font-semibold text-forest-dark/70">
            View item
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
