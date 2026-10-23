import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import StarRating from './StarRating';
import QuickViewModal from './QuickViewModal';
import { Badge } from './ui/Badge';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  if (!product) return null;

  const wishlisted = isWishlisted(product._id);
  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    await addToCart(product, 1);
    setIsAdding(false);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  const handleOpenQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const imageSrc =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  return (
    <>
      <div className="group relative bg-white rounded-2xl border border-slate-100/80 shadow-xs hover:shadow-lg hover:border-slate-200/80 transition-all duration-200 flex flex-col overflow-hidden">
        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
          {hasDiscount && (
            <Badge variant="sale" size="sm">
              -{discountPercent}%
            </Badge>
          )}
          {product.isBestseller && (
            <Badge variant="bestseller" size="sm">
              Bestseller
            </Badge>
          )}
          {product.isNewArrival && (
            <Badge variant="new" size="sm">
              New
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 ${
            wishlisted
              ? 'bg-rose-50 text-rose-500 shadow-xs'
              : 'bg-white/80 backdrop-blur-xs text-slate-400 hover:text-rose-500 hover:bg-white shadow-xs'
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Product Image Presentation */}
        <Link
          to={`/products/${product._id}`}
          className="block relative aspect-square bg-slate-50 overflow-hidden"
        >
          <img
            src={imageSrc}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
          />

          {/* Quick View Button overlay on hover (desktop) */}
          <button
            onClick={handleOpenQuickView}
            className="absolute inset-x-3 bottom-2.5 py-2 bg-white/95 backdrop-blur-xs hover:bg-white text-slate-800 text-xs font-semibold rounded-xl shadow-xs opacity-0 group-hover:opacity-100 transition-all duration-150 hidden sm:flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            Quick View
          </button>
        </Link>

        {/* Content Details */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Brand & Stock warning */}
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-semibold uppercase tracking-wider text-slate-400">
                {product.brand?.name || 'NovaShop'}
              </span>
              {product.stock <= 5 && product.stock > 0 && (
                <span className="text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">
                  Only {product.stock} left
                </span>
              )}
              {product.stock === 0 && (
                <span className="text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.2 rounded">
                  Sold Out
                </span>
              )}
            </div>

            {/* Title */}
            <Link
              to={`/products/${product._id}`}
              className="font-medium text-slate-900 text-xs sm:text-sm hover:text-emerald-700 line-clamp-2 transition-colors leading-snug"
            >
              {product.title}
            </Link>

            {/* Star Rating & Review count */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <StarRating rating={product.rating || 0} size="w-3 h-3" />
              <span className="text-[11px] text-slate-400 font-medium">
                ({product.numReviews || 0})
              </span>
            </div>
          </div>

          {/* Price & Action */}
          <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-bold text-slate-900">
                  ${effectivePrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
              aria-label="Add to cart"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 text-white hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-300 transition-colors flex items-center justify-center shadow-xs active:scale-95"
            >
              {isAdding ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
};

export default ProductCard;
