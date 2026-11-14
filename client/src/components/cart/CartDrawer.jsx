import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Button } from '../common/Button';
import { QuantityStepper } from '../common/QuantityStepper';

export function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeItem, subtotal, total, deliveryCharge, clearCart } = useCart();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    if (isCartOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`fixed right-0 top-0 h-full w-full lg:w-96 z-50 bg-surface shadow-2xl transform transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-space-md border-b border-outline-variant">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Your Cart</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
              aria-label="Close cart"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-space-md">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-6xl mb-space-md text-outline">shopping_bag</span>
                <p className="font-body-lg text-body-lg">Your cart is empty</p>
                <p className="font-body-sm text-body-sm mt-1">Add some delicious dishes to get started</p>
                <Link to="/menu" className="mt-space-lg">
                  <Button variant="primary">Browse Menu</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-space-md">
                {cartItems.map((item) => (
                  <div key={item.menuItemId} className="flex gap-space-md bg-surface-container-low rounded-xl p-space-sm">
                    <div className="w-20 h-20 rounded-lg bg-surface-container flex-shrink-0 overflow-hidden">
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
            )}
          </div>

          {/* Footer with totals */}
          {cartItems.length > 0 && (
            <div className="border-t border-outline-variant p-space-md bg-surface-container-low">
              <div className="space-y-2 mb-space-md">
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Subtotal</span>
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
              <div className="flex flex-col sm:flex-row gap-space-sm">
                <Link to="/cart" onClick={() => setIsCartOpen(false)}>
                  <Button variant="outline" fullWidth className="sm:w-auto">View Cart</Button>
                </Link>
                <Link to="/checkout" onClick={() => setIsCartOpen(false)}>
                  <Button variant="primary" fullWidth className="sm:w-auto">Proceed to Checkout</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}