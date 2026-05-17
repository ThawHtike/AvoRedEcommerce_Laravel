import { get } from 'lodash';
import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'urql';
import { useAppSelector } from '../../app/hooks';
import { Header } from '../../components/Header';
import { visitorId } from '../../features/cart/cartSlice';

// ─── GraphQL ────────────────────────────────────────────────────────────────

const GetCartItems = `
  query CartItems($visitorId: String!) {
    cartItems(visitor_id: $visitorId) {
      visitor_id
      product_id
      product {
        id
        name
        main_image_url
        price
      }
      qty
    }
  }
`;

const UpdateCartQtyMutation = `
  mutation UpdateCartQty($visitorId: String!, $productId: String!, $qty: Float!) {
    updateCartQty(visitor_id: $visitorId, product_id: $productId, qty: $qty) {
      visitor_id
      product_id
      qty
    }
  }
`;

const RemoveCartItemMutation = `
  mutation RemoveCartItem($visitorId: String!, $productId: String!) {
    removeCartItem(visitor_id: $visitorId, product_id: $productId) {
      visitor_id
      product_id
    }
  }
`;

// ─── Types ───────────────────────────────────────────────────────────────────

interface CartItem {
  visitor_id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    main_image_url: string;
    price: number;
  };
  qty: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

const SHIPPING_COST = 10.0;

export const CartShow = () => {
  const navigate = useNavigate();
  const currentVisitorId = useAppSelector(visitorId);

  const [{ fetching, data }, refetchCart] = useQuery({
    query: GetCartItems,
    variables: { visitorId: currentVisitorId },
    pause: !currentVisitorId,
  });

  const [, updateCartQty] = useMutation(UpdateCartQtyMutation);
  const [, removeCartItem] = useMutation(RemoveCartItemMutation);

  // Local qty state for optimistic UI (productId → qty)
  const [localQty, setLocalQty] = useState<Record<string, number>>({});

  const cartItems: CartItem[] = get(data, 'cartItems', []);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleQtyChange = useCallback(
    async (productId: string, newQty: number) => {
      if (newQty < 1) return;
      setLocalQty((prev) => ({ ...prev, [productId]: newQty }));
      await updateCartQty({ visitorId: currentVisitorId, productId, qty: newQty });
      refetchCart({ requestPolicy: 'network-only' });
    },
    [currentVisitorId, updateCartQty, refetchCart]
  );

  const handleRemove = useCallback(
    async (productId: string) => {
      await removeCartItem({ visitorId: currentVisitorId, productId });
      refetchCart({ requestPolicy: 'network-only' });
    },
    [currentVisitorId, removeCartItem, refetchCart]
  );

  // ── Derived totals ───────────────────────────────────────────────────────

  const cartTotal = cartItems.reduce((sum, item) => {
    const qty = localQty[item.product_id] ?? item.qty;
    return sum + get(item, 'product.price', 0) * qty;
  }, 0);

  // ── Empty state ──────────────────────────────────────────────────────────

  if (!fetching && cartItems.length === 0) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-7xl py-20 text-center">
          <svg
            className="mx-auto h-24 w-24 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="mt-6 text-2xl font-semibold text-gray-700">Your cart is empty</h2>
          <p className="mt-2 text-gray-500">Looks like you haven't added anything yet.</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded bg-red-500 px-8 py-3 text-sm font-semibold text-white hover:bg-red-600"
          >
            Start Shopping
          </Link>
        </div>
      </>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────

  return (
    <>
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-10">
        {fetching ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          </div>
        ) : (
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* ── Cart Items ─────────────────────────────────────────────── */}
            <div className="w-full bg-white px-6 py-8 shadow-sm rounded-lg lg:w-3/4">
              <div className="flex items-center justify-between border-b pb-6">
                <h1 className="text-2xl font-semibold">Shopping Cart</h1>
                <span className="text-sm font-medium text-gray-500">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Column headers */}
              <div className="mt-6 hidden grid-cols-12 gap-4 text-xs font-semibold uppercase tracking-wide text-gray-400 sm:grid">
                <span className="col-span-5">Product</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-center">Unit Price</span>
                <span className="col-span-2 text-center">Subtotal</span>
                <span className="col-span-1" />
              </div>

              <ul className="mt-4 divide-y">
                {cartItems.map((cartItem) => {
                  const productId = cartItem.product_id;
                  const qty = localQty[productId] ?? cartItem.qty;
                  const price = get(cartItem, 'product.price', 0);
                  const subtotal = (price * qty).toFixed(2);

                  return (
                    <li
                      key={productId}
                      className="grid grid-cols-12 gap-4 items-center py-5"
                    >
                      {/* Product info */}
                      <div className="col-span-12 flex items-center gap-4 sm:col-span-5">
                        <img
                          src={get(cartItem, 'product.main_image_url')}
                          alt={get(cartItem, 'product.name')}
                          className="h-20 w-20 rounded-md object-cover border border-gray-100"
                        />
                        <span className="font-medium text-sm text-gray-800 line-clamp-2">
                          {get(cartItem, 'product.name')}
                        </span>
                      </div>

                      {/* Qty stepper */}
                      <div className="col-span-4 flex items-center justify-center sm:col-span-2">
                        <button
                          onClick={() => handleQtyChange(productId, qty - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-l border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                          disabled={qty <= 1}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={qty}
                          onChange={(e) =>
                            handleQtyChange(productId, parseInt(e.target.value) || 1)
                          }
                          className="h-8 w-12 border-y border-gray-300 text-center text-sm text-gray-800 focus:outline-none"
                        />
                        <button
                          onClick={() => handleQtyChange(productId, qty + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-r border border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>

                      {/* Unit price */}
                      <span className="col-span-3 text-center text-sm font-medium text-gray-700 sm:col-span-2">
                        ${price.toFixed(2)}
                      </span>

                      {/* Subtotal */}
                      <span className="col-span-3 text-center text-sm font-semibold text-gray-900 sm:col-span-2">
                        ${subtotal}
                      </span>

                      {/* Remove */}
                      <div className="col-span-2 flex justify-center sm:col-span-1">
                        <button
                          onClick={() => handleRemove(productId)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 448 512">
                  <path d="M134.059 296H436c6.627 0 12-5.373 12-12v-56c0-6.627-5.373-12-12-12H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.569 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296z" />
                </svg>
                Continue Shopping
              </Link>
            </div>

            {/* ── Order Summary ──────────────────────────────────────────── */}
            <div className="w-full lg:w-1/4">
              <div className="rounded-lg bg-white px-6 py-8 shadow-sm">
                <h2 className="text-xl font-semibold border-b pb-4">Order Summary</h2>

                <div className="mt-6 space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>
                      Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                    </span>
                    <span className="font-medium">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-medium">${SHIPPING_COST.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 border-t pt-4 flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>${(cartTotal + SHIPPING_COST).toFixed(2)}</span>
                </div>

                {/* Promo code */}
                <div className="mt-6">
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
                    />
                    <button className="rounded border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50">
                      Apply
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="mt-6 w-full rounded bg-red-500 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-red-600 transition-colors"
                >
                  Proceed to Checkout
                </button>

                <p className="mt-4 text-center text-xs text-gray-400">
                  Secure checkout · SSL encrypted
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};