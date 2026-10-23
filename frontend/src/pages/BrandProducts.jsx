import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { ChevronRight, Tag } from 'lucide-react';

const BrandProducts = () => {
  const { slug } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        setLoading(true);
        const [brandRes, prodRes] = await Promise.all([
          api.get(`/brands/${slug}`),
          api.get(`/products?brand=${slug}&limit=24`),
        ]);

        if (brandRes.success) setBrand(brandRes.data);
        if (prodRes.success) setProducts(prodRes.data.products);
      } catch (err) {
        console.error('Failed to load brand products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-40 bg-gray-200 rounded-3xl" />
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
      {/* Brand Header */}
      <div className="rounded-3xl bg-white border border-gray-100 p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        {brand?.logo && (
          <img
            src={brand.logo}
            alt={brand.name}
            className="w-20 h-20 rounded-2xl object-cover border border-gray-100 shadow-sm"
          />
        )}
        <div className="space-y-1 text-center sm:text-left">
          <nav className="flex items-center justify-center sm:justify-start gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-emerald-600">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/products" className="hover:text-emerald-600">Brands</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-700">{brand?.name}</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{brand?.name}</h1>
          <p className="text-xs text-gray-500 max-w-xl">{brand?.description}</p>
        </div>
      </div>

      {/* Brand Catalog */}
      {products.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800">No products found for this brand</h3>
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

export default BrandProducts;
