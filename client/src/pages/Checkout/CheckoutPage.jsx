import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ordersApi } from '../../api/orders';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { CartDrawer } from '../../components/cart/CartDrawer';

const branches = ['Clifton', 'Gulshan-e-Iqbal', 'North Nazimabad'];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, subtotal, total, deliveryCharge, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    address: '',
    branch: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Full name is required';
    } else if (formData.customerName.length > 80) {
      newErrors.customerName = 'Name must be 80 characters or less';
    }

    const mobileRegex = /^(\+92|0)?3[0-9]{2}[ -]?[0-9]{7}$/;
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!mobileRegex.test(formData.mobile.replace(/[\s\-()]/g, ''))) {
      newErrors.mobile = 'Please enter a valid Pakistani mobile number (e.g., 0300-1234567)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Delivery address is required';
    } else if (formData.address.length > 300) {
      newErrors.address = 'Address must be 300 characters or less';
    }

    if (!formData.branch) {
      newErrors.branch = 'Please select a branch';
    } else if (!branches.includes(formData.branch)) {
      newErrors.branch = 'Invalid branch selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const items = cartItems.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      }));

      const orderData = {
        customerName: formData.customerName.trim(),
        mobile: formData.mobile.trim(),
        address: formData.address.trim(),
        branch: formData.branch,
        notes: formData.notes.trim() || null,
        items,
      };

      const response = await ordersApi.createOrder(orderData);

      clearCart();
      navigate(`/order-confirmation/${response.orderId}`);
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-20rem)]">
        <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg py-space-xl flex flex-col items-center justify-center h-[60vh] text-center">
          <span className="material-symbols-outlined text-6xl mb-space-md text-outline">shopping_bag</span>
          <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold mb-space-sm">Your Cart is Empty</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-lg max-w-md">
            Add some items to your cart before proceeding to checkout.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/menu')}>
            <span className="material-symbols-outlined text-[18px]">restaurant</span>
            Browse Menu
          </Button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-20rem)] pb-margin-lg">
        <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg py-space-xl">
          <div className="mb-space-xl">
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold">Checkout</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Enter your details to place your order</p>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container p-space-md rounded-xl mb-space-lg flex items-center gap-2 font-body-md text-body-md" role="alert">
              <span className="material-symbols-outlined text-[20px]">error</span>
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-gutter-lg">
            <div className="lg:w-2/3">
              <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm space-y-space-lg" noValidate>
                <div className="border-b border-outline-variant pb-space-lg">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-space-lg">Delivery Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    <Input
                      label="Full Name"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      error={errors.customerName}
                      placeholder="e.g., Ali Khan"
                      required
                      autoComplete="name"
                    />
                    <Input
                      label="Mobile Number"
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={handleChange}
                      error={errors.mobile}
                      placeholder="0300-1234567"
                      required
                      autoComplete="tel"
                    />
                  </div>

                  <Input
                    label="Delivery Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                    placeholder="House/Street, Area, City"
                    required
                    autoComplete="street-address"
                  />

                  <Select
                    label="Branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    error={errors.branch}
                    options={branches.map(b => ({ value: b, label: b }))}
                    placeholder="Select branch"
                    required
                  />
                </div>

                <div className="border-b border-outline-variant pb-space-lg">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-space-lg">Order Notes (Optional)</h2>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="notes">
                      Special Instructions
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows="3"
                      className="w-full bg-surface-container-low rounded-lg p-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface focus:shadow-[0_0_0_2px_#8d4b00] transition-all resize-y"
                      placeholder="Any special requests, allergies, or delivery instructions..."
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-xs">
                  <Button type="submit" variant="primary" fullWidth className="sm:w-auto" size="lg" loading={loading}>
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </Button>
                  <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">lock</span>
                    <span>Your information is strictly protected and never shared.</span>
                  </div>
                </div>
              </form>
            </div>

            <div className="lg:w-1/3">
              <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm sticky top-24">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-space-lg">Order Summary</h2>

                <div className="space-y-2 mb-space-lg max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.menuItemId} className="flex gap-space-md py-2 border-b border-outline-variant/30 last:border-0">
                      <div className="w-16 h-16 rounded-lg bg-surface-container flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-outline">restaurant</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body-sm text-body-sm text-on-surface font-medium truncate">{item.name}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Qty: {item.quantity}</p>
                        <p className="font-body-sm text-body-sm text-primary font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-space-lg border-t border-outline-variant pt-space-md">
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

                <div className="bg-tertiary-fixed/20 text-on-tertiary-fixed p-space-sm rounded-lg text-center font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px] inline-block mr-1">verified</span>
                  All prices include taxes
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <CartDrawer />
    </>
  );
}