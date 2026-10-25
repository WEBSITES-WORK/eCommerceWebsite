import axios from 'axios';
import { supabase, isSupabaseConfigured } from './supabase';
import { normalizeProduct, handleCatalogRequest } from './supabaseCatalog';
import { handleCartRequest } from './supabaseCart';
import { handleOrdersRequest } from './supabaseOrders';
import { handleUserFeaturesRequest } from './supabaseUser';
import { handleAdminRequest } from './supabaseAdmin';
import { handleStorageUpload } from './supabaseStorage';

export { normalizeProduct };

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Universal Supabase Router
 * Directs all frontend store, cart, checkout, admin, and storage calls to Supabase.
 */
export const dispatchSupabaseRequest = async (config) => {
  if (!isSupabaseConfigured) return null;

  const rawUrl = config.url || '';
  const url = rawUrl.replace(/^\/api/, '');
  const method = (config.method || 'get').toLowerCase();

  let body = config.data;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // Keep as string if not JSON
    }
  }

  try {
    // 1. Catalog & Store Settings (Products, Categories, Brands, Reviews by Product)
    const catalogRes = await handleCatalogRequest(url, method, config.params);
    if (catalogRes) return catalogRes;

    // 2. Shopping Cart & Coupons
    const cartRes = await handleCartRequest(url, method, body);
    if (cartRes) return cartRes;

    // 3. Checkout, Customer Orders, Admin Order Tracking
    const ordersRes = await handleOrdersRequest(url, method, body, config.params);
    if (ordersRes) return ordersRes;

    // 4. Wishlist, Addresses, Reviews, Coupons, Notifications, User Profiles
    const userRes = await handleUserFeaturesRequest(url, method, body, config.params);
    if (userRes) return userRes;

    // 5. Admin Dashboard, Product/Category/Brand Mutations, Bulk Operations
    const adminRes = await handleAdminRequest(url, method, body, config.params);
    if (adminRes) return adminRes;

    // 6. Direct Storage File Uploads
    const storageRes = await handleStorageUpload(url, method, config.data);
    if (storageRes) return storageRes;
  } catch (err) {
    console.error(`[Supabase API Handler Error] ${method.toUpperCase()} ${url}:`, err);
    throw err;
  }

  return null;
};

// Custom Axios Adapter: Route all matching requests natively through Supabase
const defaultAdapter = axios.getAdapter(axios.defaults.adapter);
api.defaults.adapter = async (config) => {
  if (isSupabaseConfigured) {
    const supabaseResult = await dispatchSupabaseRequest(config);
    if (supabaseResult) {
      return {
        data: supabaseResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
      };
    }
  }
  return defaultAdapter(config);
};

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    // Fallback attempt in case adapter was bypassed
    if (isSupabaseConfigured && error.config) {
      try {
        const fallbackResult = await dispatchSupabaseRequest(error.config);
        if (fallbackResult) {
          return fallbackResult;
        }
      } catch (fbErr) {
        return Promise.reject(fbErr);
      }
    }

    const message =
      error.response?.data?.message || error.message || 'Something went wrong';

    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      if (token && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
