import { get } from 'lodash';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'urql';
import { AvoRedApp } from '../../components/Layout/AvoRedApp';
import { ProductCard } from '../../components/ProductCard';
import { Product } from '../../types/ProductType';

// ─── GraphQL ────────────────────────────────────────────────────────────────

const GetHomepageData = `
  query GetHomepageData {
    featuredProducts: products(first: 8, featured: true) {
      data {
        id
        name
        slug
        price
        main_image_url
      }
    }
    categories {
      data {
        id
        name
        slug
        products_count
      }
    }
  }
`;

// ─── Category icons map ──────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  clothing:    '👕',
  electronics: '💻',
  home:        '🏠',
  footwear:    '👟',
  beauty:      '💄',
  sports:      '⚽',
  books:       '📚',
  toys:        '🧸',
};

const getCategoryIcon = (slug: string) =>
  CATEGORY_ICONS[slug.toLowerCase()] ?? '🛍️';

// ─── Component ───────────────────────────────────────────────────────────────

export const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const [{ fetching, data }] = useQuery({ query: GetHomepageData });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const categories = get(data, 'categories.data', []);
  const featuredProducts: Product[] = get(data, 'featuredProducts.data', []);

  return (
    <AvoRedApp>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-red-50 to-rose-100 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <span className="inline-block rounded-full bg-red-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-red-600 mb-4">
            ⚡ New arrivals this week
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Find what you love,<br />at the right price
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Thousands of products across all categories, delivered to your door.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-8 flex max-w-xl mx-auto gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for products, brands, categories…"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
            />
            <button
              type="submit"
              className="rounded-lg bg-red-500 px-6 py-3 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
            >
              Search
            </button>
          </form>

          <div className="mt-6 flex justify-center gap-4">
            <Link
              to="/category"
              className="rounded-lg bg-red-500 px-8 py-3 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
            >
              Shop now
            </Link>
            <Link
              to="/cart"
              className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View cart
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">

        {/* ── Shipping banner ───────────────────────────────────────────── */}
        <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-red-50 border border-red-100 px-6 py-4">
          <div>
            <p className="font-semibold text-gray-800">🚚 Free shipping on orders over $50</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Use code <span className="font-mono font-semibold text-red-600">FREESHIP</span> at checkout · Valid this week only
            </p>
          </div>
          <Link
            to="/checkout"
            className="shrink-0 rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
          >
            Claim offer
          </Link>
        </div>

        {/* ── Categories ────────────────────────────────────────────────── */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Browse categories</h2>
          {fetching ? (
            <div className="flex gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-28 w-28 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="flex flex-col items-center rounded-xl border border-gray-200 bg-white px-4 py-5 text-center hover:border-red-300 hover:shadow-sm transition-all"
                >
                  <span className="text-3xl mb-2">{getCategoryIcon(cat.slug)}</span>
                  <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
                  {cat.products_count !== undefined && (
                    <span className="mt-1 text-xs text-gray-400">{cat.products_count} items</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Featured products ─────────────────────────────────────────── */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Featured products</h2>
            <Link
              to="/products"
              className="text-sm font-semibold text-red-500 hover:text-red-600"
            >
              View all →
            </Link>
          </div>

          {fetching ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl bg-gray-100 h-64" />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <p className="text-gray-400 text-sm">No featured products yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

      </div>
    </AvoRedApp>
  );
};