import React, { useState } from 'react';
import { X, Check, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(
    product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [isAdding, setIsAdding] = useState(false);

  const wishlisted = isWishlisted(product._id);
  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  const handleVariantSelect = (variantName, option) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: option,
    }));
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(product, quantity, selectedVariants);
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl bg-gray-50 overflow-hidden border border-gray-100 flex items-center justify-center">
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                      selectedImage === img ? 'border-emerald-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              {product.brand?.name && (
                <span className="text-xs font-semibold tracking-wider text-emerald-700 uppercase bg-emerald-50 px-2 py-1 rounded">
                  {product.brand.name}
                </span>
              )}

              <h2 className="text-xl font-bold text-gray-900 mt-2 line-clamp-2">
                {product.title}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={product.rating || 0} />
                <span className="text-xs text-gray-500 font-medium">
                  {product.rating?.toFixed(1) || '0.0'} ({product.numReviews || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl font-bold text-gray-900">
                  ${effectivePrice.toFixed(2)}
                </span>
                {product.discountPrice > 0 && (
                  <span className="text-base text-gray-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
                {product.discountPrice > 0 && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Save ${(product.price - product.discountPrice).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description snippet */}
              <p className="text-sm text-gray-600 mt-3 line-clamp-3 leading-relaxed">
                {product.description}
              </p>

              {/* Variants */}
              {product.variants &&
                product.variants.map((v) => (
                  <div key={v.name} className="mt-4">
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5 uppercase">
                      {v.name}: <span className="text-gray-900">{selectedVariants[v.name] || 'Select'}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {v.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleVariantSelect(v.name, opt)}
                          className={`px-3 py-1 text-xs font-medium rounded-lg border transition ${
                            selectedVariants[v.name] === opt
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                              : 'border-gray-200 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

              {/* Quantity */}
              <div className="mt-5 flex items-center gap-4">
                <span className="text-xs font-semibold text-gray-700 uppercase">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-sm font-semibold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-100 mt-6 flex gap-3">
              <button
                disabled={product.stock === 0 || isAdding}
                onClick={handleAddToCart}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
              >
                <ShoppingCart className="w-4 h-4" />
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>

              <button
                onClick={() => toggleWishlist(product._id)}
                className={`p-2.5 rounded-xl border transition ${
                  wishlisted
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-gray-300 hover:border-gray-400 text-gray-600'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500' : ''}`} />
              </button>

              <Link
                to={`/products/${product._id}`}
                onClick={onClose}
                className="p-2.5 rounded-xl border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-900 transition flex items-center"
                title="Full Product Page"
              >
                <Eye className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
