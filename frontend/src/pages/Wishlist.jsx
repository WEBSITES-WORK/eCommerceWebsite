import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

const Wishlist = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <EmptyState
          icon={Heart}
          title="Sign in to View Wishlist"
          description="Save your favorite products, track price drops, and keep your wishlist synced across all your devices."
          actionText="Sign In"
          actionHref="/login?redirect=/wishlist"
        />
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Explore our catalog and tap the heart icon on items you'd like to save for later."
          actionText="Discover Products"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              My Wishlist
            </h1>
            <Badge variant="outline" size="sm">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Saved items ready to move to your cart whenever you are ready
          </p>
        </div>

        <Link to="/products">
          <Button variant="secondary" size="sm" icon={ArrowRight}>
            Continue Shopping
          </Button>
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {wishlist.map((product) => {
          if (!product) return null;
          const effectivePrice =
            product.discountPrice > 0 ? product.discountPrice : product.price;
          const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
          const discountPct = hasDiscount
            ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
            : 0;
          const isOutOfStock = product.stock <= 0;

          return (
            <div
              key={product._id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md hover:border-gray-200 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Image & overlay badges */}
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                <Link to={`/products/${product._id}`} className="block w-full h-full">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                    alt={product.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </Link>

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none">
                  {hasDiscount && <Badge variant="sale" size="xs">-{discountPct}%</Badge>}
                  {isOutOfStock && <Badge variant="danger" size="xs">Out of Stock</Badge>}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => toggleWishlist(product._id)}
                  aria-label="Remove from wishlist"
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-white/95 backdrop-blur-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-gray-100 shadow-2xs flex items-center justify-center transition"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {product.brand?.name || product.category?.name || 'NovaShop'}
                  </span>
                  <Link
                    to={`/products/${product._id}`}
                    className="block font-semibold text-xs sm:text-sm text-gray-900 hover:text-emerald-600 transition line-clamp-2 leading-snug"
                  >
                    {product.title}
                  </Link>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <StarRating rating={product.rating || 0} size="w-3 h-3" />
                    <span className="text-[11px] text-gray-400 font-medium">
                      ({product.numReviews || 0})
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-sm sm:text-base font-extrabold text-gray-900">
                      ${effectivePrice.toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart CTA */}
                <Button
                  onClick={() => addToCart(product, 1)}
                  disabled={isOutOfStock}
                  variant={isOutOfStock ? 'outline' : 'primary'}
                  size="sm"
                  fullWidth
                  icon={ShoppingBag}
                >
                  {isOutOfStock ? 'Sold Out' : 'Move to Cart'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
