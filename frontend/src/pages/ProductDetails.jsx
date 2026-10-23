import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ChevronRight,
  Share2,
} from 'lucide-react';
import api from '../services/api';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useSEO from '../hooks/useSEO';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);

  useSEO({
    title: product ? `${product.title} | Buy Online` : 'Loading Product...',
    description: product ? product.description?.slice(0, 160) : 'View product specifications and verified customer ratings.',
    image: product?.images?.[0] || '/logo.png',
  });
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Review Form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const [prodRes, revRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/product/${id}`),
        ]);

        if (prodRes.success && prodRes.data) {
          const p = prodRes.data;
          setProduct(p);
          setActiveImage(p.images?.[0] || '');

          if (p.variants && p.variants.length > 0) {
            const defaults = {};
            p.variants.forEach((v) => {
              if (v.options?.length > 0) defaults[v.name] = v.options[0];
            });
            setSelectedVariants(defaults);
          }

          try {
            const relRes = await api.get(`/products/${p._id}/related`);
            if (relRes.success) setRelated(relRes.data);
          } catch (e) {
            console.error('Related error:', e);
          }
        }

        if (revRes.success) {
          setReviews(revRes.data);
        }
      } catch (err) {
        console.error('Product details error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleVariantSelect = (name, opt) => {
    setSelectedVariants((prev) => ({ ...prev, [name]: opt }));
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    await addToCart(product, quantity, selectedVariants);
    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    const added = await addToCart(product, quantity, selectedVariants);
    if (added) {
      navigate('/checkout');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to write a review', 'info');
      navigate('/login');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.post('/reviews', {
        productId: product._id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      if (res.success && res.data) {
        showToast('Review submitted successfully!', 'success');
        setReviews([res.data, ...reviews]);
        setReviewTitle('');
        setReviewComment('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <Link to="/products" className="mt-3 inline-block text-emerald-700 font-semibold text-xs">
          Return to All Products
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product._id);
  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link to="/" className="hover:text-slate-900">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-slate-900">Products</Link>
        {product.category?.name && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/category/${product.category.slug}`} className="hover:text-slate-900">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-700 font-medium truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main Product Details Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
        {/* Left: Gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-3xl bg-white border border-stone-200/80 overflow-hidden flex items-center justify-center relative shadow-xs">
            <img
              src={activeImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {hasDiscount && (
              <div className="absolute top-4 left-4">
                <Badge variant="sale" size="md">
                  Save {discountPercent}%
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-18 h-18 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition ${
                    activeImage === img
                      ? 'border-emerald-600 shadow-xs'
                      : 'border-stone-200/70 opacity-70 hover:opacity-100 hover:border-stone-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Meta & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {product.brand && (
                <Link
                  to={`/brand/${product.brand.slug}`}
                  className="text-xs font-bold text-emerald-700 uppercase tracking-wider hover:text-emerald-800"
                >
                  {product.brand.name}
                </Link>
              )}
              <span className="text-[11px] text-stone-400 font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2.5">
              <StarRating rating={product.rating || 0} size="w-3.5 h-3.5" />
              <span className="text-xs font-bold text-slate-800">
                {product.rating?.toFixed(1) || '0.0'}
              </span>
              <span className="text-stone-300">•</span>
              <a href="#reviews" className="text-xs text-stone-500 hover:text-emerald-700 font-medium">
                {reviews.length} Verified Reviews
              </a>
            </div>

            {/* Pricing */}
            <div className="pt-2 flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ${effectivePrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-base text-stone-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
              {hasDiscount && (
                <Badge variant="sale" size="sm">
                  Save ${(product.price - product.discountPrice).toFixed(2)}
                </Badge>
              )}
            </div>

            {/* Stock status badge */}
            <div className="pt-1">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                  <Check className="w-3 h-3 text-emerald-600" />
                  In Stock ({product.stock} units ready for immediate dispatch)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200/60 px-2.5 py-0.5 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Variants Selectors */}
            {product.variants &&
              product.variants.map((v) => (
                <div key={v.name} className="pt-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                    {v.name}: <span className="text-slate-900 font-semibold">{selectedVariants[v.name]}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleVariantSelect(v.name, opt)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                          selectedVariants[v.name] === opt
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-600 shadow-xs'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            {/* Quantity */}
            <div className="pt-2 flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Quantity:
              </span>
              <div className="flex items-center border border-stone-200 rounded-xl bg-white shadow-2xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-stone-600 hover:text-slate-900 font-bold transition"
                >
                  -
                </button>
                <span className="px-3.5 py-1.5 text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-1.5 text-stone-600 hover:text-slate-900 font-bold transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-stone-200/80 space-y-4">
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="lg"
                disabled={product.stock === 0}
                loading={isAdding}
                icon={ShoppingCart}
                onClick={handleAddToCart}
                className="flex-1"
              >
                Add to Cart
              </Button>

              <Button
                variant="dark"
                size="lg"
                disabled={product.stock === 0}
                onClick={handleBuyNow}
                className="flex-1"
              >
                Buy Now
              </Button>

              <button
                onClick={() => toggleWishlist(product._id)}
                aria-label="Wishlist"
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition ${
                  wishlisted
                    ? 'border-rose-200 bg-rose-50 text-rose-500'
                    : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Assurances */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 text-center">
              <div className="p-3 rounded-2xl bg-white border border-stone-200/80 text-[11px] font-semibold text-slate-700 flex flex-col items-center gap-1.5 shadow-2xs">
                <Truck className="w-4 h-4 text-emerald-600" />
                Free Express Delivery
              </div>
              <div className="p-3 rounded-2xl bg-white border border-stone-200/80 text-[11px] font-semibold text-slate-700 flex flex-col items-center gap-1.5 shadow-2xs">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                30-Day Guaranteed Returns
              </div>
              <div className="p-3 rounded-2xl bg-white border border-stone-200/80 text-[11px] font-semibold text-slate-700 flex flex-col items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                1-Year Factory Warranty
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <section className="pt-6 border-t border-stone-200/80">
        <div className="flex border-b border-stone-200 gap-8">
          {['description', 'specifications', 'shipping', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition ${
                activeTab === tab
                  ? 'text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              {tab === 'reviews' ? `Reviews (${reviews.length})` : tab}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === 'description' && (
            <div className="prose text-slate-600 text-xs sm:text-sm leading-relaxed space-y-4 max-w-3xl">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-xl">
              {product.specifications && product.specifications.length > 0 ? (
                <dl className="divide-y divide-slate-100 text-xs">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="py-2.5 grid grid-cols-3">
                      <dt className="font-bold text-slate-900">{spec.key}</dt>
                      <dd className="col-span-2 text-slate-600">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-xs text-slate-400">No extra specifications listed.</p>
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-xl text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>Logistics:</strong> In-stock orders are packed and dispatched within 24 hours. Free express shipping applies on orders totaling over $99.
              </p>
              <p>
                <strong>Returns:</strong> 30-day money-back guarantee on all items in original condition.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div id="reviews" className="space-y-8 max-w-3xl">
              {/* Form */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Write a Customer Review
                </h3>
                <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Your Rating</label>
                    <StarRating
                      rating={reviewRating}
                      interactive={true}
                      onRate={setReviewRating}
                      size="w-5 h-5"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Headline</label>
                    <input
                      type="text"
                      placeholder="e.g. Excellent sound quality and battery life"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Review *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share your experience..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900"
                    />
                  </div>
                  <Button variant="primary" size="md" loading={submittingReview}>
                    Submit Review
                  </Button>
                </form>
              </div>

              {/* Reviews list */}
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r._id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <StarRating rating={r.rating} size="w-3.5 h-3.5" />
                      <span className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    {r.title && <h4 className="text-xs font-bold text-slate-900">{r.title}</h4>}
                    <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-700">{r.user?.name || 'Verified Customer'}</span>
                      {r.isVerifiedPurchase && (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded-full">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pt-6 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
