import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { ChevronRight, Layers } from 'lucide-react';

const CategoryProducts = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get(`/categories/${slug}`),
          api.get(`/products?category=${slug}&limit=24`),
        ]);

        if (catRes.success) setCategory(catRes.data);
        if (prodRes.success) setProducts(prodRes.data.products);
      } catch (err) {
        console.error('Failed to load category products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-48 bg-gray-200 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 sm:p-12 shadow-xl">
        {category?.image && (
          <img
            src={category.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative z-10 max-w-xl space-y-3">
          <nav className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
            <Link to="/" className="hover:underline">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/products" className="hover:underline">Categories</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{category?.name}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {category?.name || 'Category'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {category?.description || 'Browse high-quality merchandise in this curated collection.'}
          </p>
          <p className="text-xs font-semibold text-emerald-400">
            {products.length} products available
          </p>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
          <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800">No products found in this category</h3>
          <p className="text-xs text-gray-500 mt-1">Check back soon for new arrivals!</p>
          <Link
            to="/products"
            className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
          >
            Browse All Products
          </Link>
        </div>
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

export default CategoryProducts;
