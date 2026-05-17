import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "urql";
import { get } from "lodash";
import { FormattedMessage } from "react-intl";
import { AvoRedApp } from "../components/Layout/AvoRedApp";
import { ProductCard } from "../components/ProductCard";
import { Product } from "../types/ProductType";

const GetHomepageData = `
  query GetHomepageData {
    allCategory {
      id
      name
      slug
    }
    products(first: 8) {
      data {
        id
        name
        slug
        price
        main_image_url
      }
    }
  }
`;

export const Index = () => {
  const [{ fetching, data }] = useQuery({ query: GetHomepageData });

  const categories = get(data, 'allCategory', []);
  const products: Product[] = get(data, 'products.data', []);

  return (
    <AvoRedApp>
      {/* ── Hero banner ───────────────────────────────────────────────── */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            <FormattedMessage id="home_page" />
            AvoRed E commerce Demo
          </h1>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">

            {/* ── Featured collection ───────────────────────────────────── */}
            <section>
              <div className="max-w-screen-xl px-4 py-8 mx-auto sm:px-6 sm:py-12 lg:px-8">
                <header className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 sm:text-3xl">
                    New Collection
                  </h2>
                  <p className="max-w-md mx-auto mt-4 text-gray-500">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Itaque
                    praesentium cumque iure dicta incidunt est ipsam, officia dolor fugit natus?
                  </p>
                </header>

                <ul className="grid grid-cols-1 gap-4 mt-8 lg:grid-cols-3">
                  {/* Static promo cards — link to real categories */}
                  <li>
                    <Link
                      to={categories[0] ? `/category/${categories[0].slug}` : '/'}
                      className="relative block group"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1618898909019-010e4e234c55?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80"
                        alt=""
                        className="object-cover w-full transition duration-500 aspect-square group-hover:opacity-90"
                      />
                      <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
                        <h3 className="text-xl font-medium text-white">
                          {categories[0]?.name ?? 'Collection 1'}
                        </h3>
                        <span className="mt-1.5 inline-block bg-black px-5 py-3 text-xs font-medium uppercase tracking-wide text-white">
                          Shop Now
                        </span>
                      </div>
                    </Link>
                  </li>

                  <li>
                    <Link
                      to={categories[1] ? `/category/${categories[1].slug}` : '/'}
                      className="relative block group"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1624623278313-a930126a11c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80"
                        alt=""
                        className="object-cover w-full transition duration-500 aspect-square group-hover:opacity-90"
                      />
                      <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
                        <h3 className="text-xl font-medium text-white">
                          {categories[1]?.name ?? 'Collection 2'}
                        </h3>
                        <span className="mt-1.5 inline-block bg-black px-5 py-3 text-xs font-medium uppercase tracking-wide text-white">
                          Shop Now
                        </span>
                      </div>
                    </Link>
                  </li>

                  <li className="lg:col-span-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
                    <Link
                      to={categories[2] ? `/category/${categories[2].slug}` : '/'}
                      className="relative block group"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1593795899768-947c4929449d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2672&q=80"
                        alt=""
                        className="object-cover w-full transition duration-500 aspect-square group-hover:opacity-90"
                      />
                      <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
                        <h3 className="text-xl font-medium text-white">
                          {categories[2]?.name ?? 'Collection 3'}
                        </h3>
                        <span className="mt-1.5 inline-block bg-black px-5 py-3 text-xs font-medium uppercase tracking-wide text-white">
                          Shop Now
                        </span>
                      </div>
                    </Link>
                  </li>
                </ul>
              </div>
            </section>

            {/* ── All categories ────────────────────────────────────────── */}
            {categories.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Browse Categories</h2>
                <div className="flex flex-wrap gap-3">
                  {categories.map((cat: any) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── Featured products ─────────────────────────────────────── */}
            <section className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
              </div>

              {fetching ? (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse rounded-xl bg-gray-100 h-64" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <p className="text-gray-400 text-sm">No products yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>
      </main>
    </AvoRedApp>
  );
};