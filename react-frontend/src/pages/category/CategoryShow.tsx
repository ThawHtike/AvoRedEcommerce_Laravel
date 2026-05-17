import { Menu, Transition } from '@headlessui/react';
import { get } from 'lodash';
import React, { Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'urql';
import { ProductCard } from '../../components/ProductCard';
import { Product } from '../../types/ProductType';
import { AvoRedApp } from '../../components/Layout/AvoRedApp';

const GetCategory = `
query GetCategory ($slug: String!) {
  category (slug: $slug) {
      id
      name
      slug
      meta_title
      meta_description
      products {
        data {
            id
            name
            slug
            price
            main_image_url
        }
    }
  }
}
`;

export const CategoryShow = () => {
  let { slug } = useParams();
  const [{ fetching, data }] = useQuery({ query: GetCategory, variables: { slug } });

  const products: Product[] = get(data, 'category.products.data', []);

  return (
    <AvoRedApp>
      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      ) : (
        <>
          <header className="bg-white shadow">
            <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {get(data, 'category.name')}
              </h1>
            </div>
          </header>

          <main>
            <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">

              {/* Sort bar */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-6">
                <p className="text-sm text-gray-500">
                  {products.length} {products.length === 1 ? 'product' : 'products'}
                </p>
                <Menu as="div" className="relative inline-block text-left">
                  <Menu.Button className="inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sort
                    <svg className="-mr-1 ml-1 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <a href="#" className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-500`}>
                              Price: Low to High
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a href="#" className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-500`}>
                              Price: High to Low
                            </a>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>

              {/* Product grid */}
              {products.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-lg">No products in this category yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                  {products.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

            </div>
          </main>
        </>
      )}
    </AvoRedApp>
  );
};