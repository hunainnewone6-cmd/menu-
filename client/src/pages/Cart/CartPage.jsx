import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/common/Button';
import { QuantityStepper } from '../../components/common/QuantityStepper';

export function CartPage() {
  const { cartItems, updateQuantity, removeItem, clearCart, subtotal, total, deliveryCharge } = useCart();

  if (cartItems.length === 0) {
    return (
      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-20rem)]">
        <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg py-space-xl flex flex-col items-center justify-center h-[60vh] text-center">
          <span className="material-symbols-outlined text-6xl mb-space-md text-outline">shopping_bag</span>
          <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold mb-space-sm">Your Cart is Empty</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-lg max-w-md">
            Looks like you haven't added any delicious Karachi dishes yet. Browse our menu and add your favorites!
          </p>
          <Link to="/menu">
            <Button variant="primary" size="lg">
              <span className="material-symbols-outlined text-[18px]">restaurant</span>
              Browse Menu
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full pt-20 bg-surface min-h-[calc(100vh-20rem)] pb-margin-lg">
      <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg py-space-xl">
        <div className="flex flex-col lg:flex-row gap-gutter-lg">
          <div className="lg:w-2/3 flex flex-col gap-space-md">
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold">Your Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</h1>

            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm">
              {cartItems.map((item) => (
                <div key={item.menuItemId} className="flex gap-space-md p-space-md border-b border-outline-variant/50 last:border-0">
                  <div className="w-24 h-24 rounded-lg bg-surface-container flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl text-outline">restaurant</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">{item.name}</h3>
                      <p className="font-body-sm text-body-sm text-primary font-bold">Rs. {item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(qty) => updateQuantity(item.menuItemId, qty)}
                        max={50}
                        aria-label={`${item.name} quantity`}
                      />
                      <button
                        onClick={() => removeItem(item.menuItemId)}
                        className="text-on-surface-variant hover:text-error transition-colors p-1"
                        aria-label={`Remove ${item.name}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={clearCart}
                className="text-on-surface-variant hover:text-error transition-colors font-label-md text-label-md flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                Clear Cart
              </button>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm sticky top-24">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-space-lg">Order Summary</h2>

              <div className="space-y-3 mb-space-lg">
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                  <span className="text-on-surface font-semibold">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Delivery Charge</span>
                  <span className="text-on-surface font-semibold">Rs. {deliveryCharge.toLocaleString()}</span>
                </div>
                <div className="h-[1px] bg-outline-variant"></div>
                <div className="flex justify-between font-headline-md text-headline-md font-bold">
                  <span className="text-on-surface">Total</span>
                  <span className="text-primary">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-tertiary-fixed/20 text-on-tertiary-fixed p-space-sm rounded-lg mb-space-md text-center font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[16px] inline-block mr-1">verified</span>
                All prices include taxes. Delivery charge: Rs. {deliveryCharge.toLocaleString()}
              </div>

              <Link to="/checkout">
                <Button variant="primary" fullWidth size="lg">
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  Proceed to Checkout
                </Button>
              </Link>

              <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-space-md">
                <span className="material-symbols-outlined text-[14px] inline-block mr-1">lock</span>
                Secure checkout powered by Karachi Bites
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}