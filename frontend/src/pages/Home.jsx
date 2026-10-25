import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Flame,
  ShieldCheck,
  TrendingUp,
  Clock,
  ChevronRight,
  Star,
  Truck,
  RotateCcw,
  Headphones,
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import useSEO from '../hooks/useSEO';

const Home = () => {
  useSEO({
    title: 'Flagship Electronics, Audio, Apparel & Living',
    description: 'Explore trending electronics, premium noise-cancelling headphones, high-performance computing, and streetwear at NovaShop.',
  });

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Flash sale countdown timer simulator
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featRes, bestRes, newRes, catRes, brandRes] = await Promise.all([
          api.get('/products?isFeatured=true&limit=8'),
          api.get('/products?isBestseller=true&limit=8'),
          api.get('/products?isNewArrival=true&limit=8'),
          api.get('/categories'),
          api.get('/brands'),
        ]);

        if (featRes.success) setFeaturedProducts(featRes.data.products);
        if (bestRes.success) setBestsellers(bestRes.data.products);
        if (newRes.success) setNewArrivals(newRes.data.products);
        if (catRes.success) setCategories(catRes.data);
        if (brandRes.success) setBrands(brandRes.data);
      } catch (err) {
        console.error('Home page loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Section - Clean Editorial / Modern Commercial */}
      <section className="bg-slate-900 text-white rounded-3xl mx-3 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Autumn / Winter 2026 Collection</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Engineered for <br />
              <span className="text-emerald-400">Pure Performance.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-md leading-relaxed">
              Curated premium hardware, audio systems, athletic footwear, and intelligent lifestyle essentials with instant checkout and express dispatch.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/products">
                <Button variant="accent" size="lg">
                  Shop Collection <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/products?isBestseller=true">
                <Button variant="secondary" size="lg">
                  Explore Bestsellers
                </Button>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800 text-left">
              <div>
                <p className="text-xl sm:text-2xl font-black text-white">50K+</p>
                <p className="text-xs text-slate-400 mt-0.5">Verified Shoppers</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-white">100%</p>
                <p className="text-xs text-slate-400 mt-0.5">Authentic Stock</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-white">48h</p>
                <p className="text-xs text-slate-400 mt-0.5">Express Delivery</p>
              </div>
            </div>
          </div>

          {/* Hero Spotlight Visual */}
          <div className="relative">
            {featuredProducts[0] ? (
              <Link to={`/products/${featuredProducts[0].slug || featuredProducts[0]._id}`} className="block">
                <div className="aspect-square max-w-md mx-auto rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative group bg-slate-800">
                  <img
                    src={featuredProducts[0].images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                    alt={featuredProducts[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex flex-col justify-end p-6">
                    <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                      Featured Spotlight
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1 line-clamp-1">
                      {featuredProducts[0].title}
                    </h3>
                    <p className="text-sm font-semibold text-slate-200 mt-0.5">
                      ${featuredProducts[0].discountPrice || featuredProducts[0].price}
                      {featuredProducts[0].discountPrice && featuredProducts[0].discountPrice < featuredProducts[0].price && (
                        <span className="line-through text-xs text-slate-400 ml-2">
                          ${featuredProducts[0].price}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="aspect-square max-w-md mx-auto rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-850 animate-pulse flex items-center justify-center text-slate-600">
                <ShoppingBag className="w-12 h-12" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Departments
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            All Departments <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-4/5 bg-slate-100 border border-slate-100 flex flex-col justify-end p-4 shadow-2xs hover:shadow-md transition-all duration-200"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative z-10 text-white">
                <h3 className="text-sm font-bold tracking-tight">{cat.name}</h3>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5 font-medium">
                  {cat.description || 'Explore items'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Flash Sale Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-800/40">
              <Flame className="w-3.5 h-3.5 fill-emerald-400" />
              Limited-Time Flash Deals
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Save up to 30% on Certified Audio & Wearables
            </h2>
            <p className="text-xs text-slate-400 max-w-lg">
              Special promotional prices valid while quantities last. Enter coupon <strong>NOVAFIRST</strong> at checkout.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-800/90 px-3.5 py-2.5 rounded-xl text-center min-w-[60px] border border-slate-700/60">
              <span className="text-xl font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="block text-[9px] text-slate-400 uppercase font-semibold">Hours</span>
            </div>
            <span className="text-xl font-bold text-slate-500">:</span>
            <div className="bg-slate-800/90 px-3.5 py-2.5 rounded-xl text-center min-w-[60px] border border-slate-700/60">
              <span className="text-xl font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="block text-[9px] text-slate-400 uppercase font-semibold">Mins</span>
            </div>
            <span className="text-xl font-bold text-slate-500">:</span>
            <div className="bg-slate-800/90 px-3.5 py-2.5 rounded-xl text-center min-w-[60px] border border-slate-700/60">
              <span className="text-xl font-black text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="block text-[9px] text-slate-400 uppercase font-semibold">Secs</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Best Sellers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Trending
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/products?isBestseller=true"
            className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {bestsellers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Dual Category Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 p-8 text-white flex flex-col justify-between min-h-[240px]">
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-30 hover:scale-103 transition-transform duration-500"
            />
            <div className="relative z-10 space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Athletic Apparel
              </span>
              <h3 className="text-2xl font-extrabold">Nike Running & Urban Wear</h3>
              <p className="text-xs text-slate-300 max-w-xs mt-1">
                Ultralight Flyknit weaves combined with responsive air cushions.
              </p>
            </div>
            <div className="relative z-10 pt-4">
              <Link to="/brand/nike">
                <Button variant="outline" size="sm" className="bg-white text-slate-900 hover:bg-slate-100 border-transparent font-bold">
                  Shop Nike
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-slate-900 p-8 text-white flex flex-col justify-between min-h-[240px]">
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-30 hover:scale-103 transition-transform duration-500"
            />
            <div className="relative z-10 space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Smart Ecosystem
              </span>
              <h3 className="text-2xl font-extrabold">Apple Hardware & Watches</h3>
              <p className="text-xs text-slate-300 max-w-xs mt-1">
                Precision biometric sensors, OLED displays, and cellular connectivity.
              </p>
            </div>
            <div className="relative z-10 pt-4">
              <Link to="/brand/apple">
                <Button variant="outline" size="sm" className="bg-white text-slate-900 hover:bg-slate-100 border-transparent font-bold">
                  Shop Apple
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. New Arrivals Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Catalog Updates
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/products?isNewArrival=true"
            className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 7. Partner Brands */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-y border-slate-100">
        <div className="text-center mb-6">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Direct Manufacturer Partnerships
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
          {brands.map((b) => (
            <Link
              key={b._id}
              to={`/brand/${b.slug}`}
              className="text-slate-400 hover:text-slate-900 font-extrabold text-base sm:text-lg tracking-tighter uppercase transition"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>

      {/* 8. Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Verified Experiences
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Trusted by 50,000+ Shoppers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "The order arrived in 48 hours flat, sealed impeccably. The noise cancellation on the Sony XM5s made my flights pure silence."
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                SC
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Sarah Connor</h4>
                <span className="text-[10px] text-emerald-600 font-semibold">Verified Buyer</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Clean checkout, transparent tracking with live carrier updates, and applying the promo code was effortless."
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                DL
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">David Lin</h4>
                <span className="text-[10px] text-emerald-600 font-semibold">Verified Buyer</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Customer support responded within minutes when I asked about sizing for the Nike Flyknits. The shoe fit true to size."
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                ER
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Elena Rodriguez</h4>
                <span className="text-[10px] text-emerald-600 font-semibold">Verified Buyer</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
