import { useState } from 'react';
import { ordersApi } from '../../api/orders';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export function OrderTrackingPage() {
  const [orderId, setOrderId] = useState('');
  const [mobile, setMobile] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setSearched(true);

    if (!orderId.trim()) {
      setError('Please enter an Order ID');
      return;
    }

    setLoading(true);

    try {
      const data = await ordersApi.getOrder(orderId.trim(), mobile.trim() || null);
      setOrder(data);
    } catch (err) {
      if (err.status === 404) {
        setError('Order not found. Please check your Order ID and mobile number.');
      } else {
        setError(err.message || 'Failed to track order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOrderId('');
    setMobile('');
    setOrder(null);
    setError('');
    setSearched(false);
  };

  const getStatusStep = (status) => {
    const steps = ['Received', 'Preparing', 'Out for Delivery', 'Delivered'];
    return steps.indexOf(status);
  };

  return (
    <main className="w-full pt-20 bg-surface min-h-[calc(100vh-20rem)] pb-margin-lg">
      <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg py-space-xl">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-space-xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-fixed text-on-primary-fixed mb-space-lg">
              <span className="material-symbols-outlined text-[32px]">track_changes</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold mb-space-sm">Track Your Order</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Enter your Order ID and mobile number to get real-time updates</p>
          </div>

          {!order && (
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-space-lg">
                <Input
                  label="Order ID"
                  name="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  error={searched && !orderId ? 'Order ID is required' : undefined}
                  placeholder="e.g., KB-ABC123-XYZ789"
                  required
                  autoComplete="off"
                />

                <Input
                  label="Mobile Number (Optional)"
                  name="mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="0300-1234567"
                  helperText="Enter for detailed order info (optional)"
                  autoComplete="tel"
                />

                <div className="flex flex-col sm:flex-row gap-space-sm pt-space-md">
                  <Button type="submit" variant="primary" fullWidth className="sm:w-auto" size="lg" loading={loading}>
                    <span className="material-symbols-outlined text-[18px]">search</span>
                    {loading ? 'Tracking...' : 'Track Order'}
                  </Button>
                  {searched && (
                    <Button type="button" variant="outline" fullWidth className="sm:w-auto" size="lg" onClick={handleReset}>
                      <span className="material-symbols-outlined text-[18px]">refresh</span>
                      New Search
                    </Button>
                  )}
                </div>

                {error && (
                  <div className="bg-error-container text-on-error-container p-space-md rounded-xl flex items-center gap-2 font-body-md text-body-md" role="alert">
                    <span className="material-symbols-outlined text-[20px]">error</span>
                    {error}
                  </div>
                )}
              </form>
            </div>
          )}

          {order && (
            <div className="space-y-space-lg">
              <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-md mb-space-lg">
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Order ID</p>
                    <p className="font-headline-md text-headline-md text-on-surface font-bold font-mono">{order.orderId}</p>
                  </div>
                  <div className="flex items-center gap-space-md">
                    <span className={`inline-flex items-center gap-1 px-space-md py-1.5 rounded-full font-label-sm text-label-sm font-bold ${
                      order.status === 'Delivered' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
                      order.status === 'Out for Delivery' ? 'bg-primary-fixed text-on-primary-fixed' :
                      order.status === 'Preparing' ? 'bg-secondary-fixed text-on-secondary-fixed' :
                      'bg-surface-container-high text-on-surface'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        order.status === 'Delivered' ? 'bg-tertiary' :
                        order.status === 'Out for Delivery' ? 'bg-primary animate-pulse' :
                        order.status === 'Preparing' ? 'bg-secondary animate-pulse' :
                        'bg-outline'
                      }`}></span>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md text-on-surface-variant font-body-md text-body-md">
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Branch</p>
                    <p className="font-body-md text-body-md text-on-surface font-semibold">{order.branch}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Placed On</p>
                    <p className="font-body-md text-body-md text-on-surface font-semibold">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Last Updated</p>
                    <p className="font-body-md text-body-md text-on-surface font-semibold">{new Date(order.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-space-lg">Delivery Progress</h2>
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-outline-variant" />
                  <div className="space-y-space-lg">
                    {['Received', 'Preparing', 'Out for Delivery', 'Delivered'].map((step, index) => {
                      const currentStep = getStatusStep(order.status);
                      const isActive = index <= currentStep;
                      const isCurrent = index === currentStep;

                      return (
                        <div key={step} className="relative flex gap-space-md">
                          <div className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                            isActive ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-outline'
                          }`}>
                            {isActive ? (
                              <span className="material-symbols-outlined text-[24px]">check</span>
                            ) : (
                              <span className="material-symbols-outlined text-[24px]">{index === 0 ? 'receipt_long' : index === 1 ? 'restaurant' : index === 2 ? 'local_shipping' : 'check_circle'}</span>
                            )}
                          </div>
                          <div className={`flex-1 pt-1 ${
                            isCurrent ? 'font-bold text-on-surface' : 'text-on-surface-variant'
                          }`}>
                            <p className="font-headline-sm text-headline-sm">{step}</p>
                            {isCurrent && (
                              <p className="font-body-sm text-body-sm text-primary mt-0.5 animate-pulse">
                                {index === 0 && 'Order received and confirmed'}
                                {index === 1 && 'Our chefs are preparing your meal'}
                                {index === 2 && 'Out for delivery - arriving soon'}
                                {index === 3 && 'Order delivered successfully'}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-space-lg">Order Items</h2>
                <div className="space-y-space-md">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-space-md py-space-md border-b border-outline-variant/30 last:border-0">
                      <div className="w-16 h-16 rounded-lg bg-surface-container flex-shrink-0 overflow-hidden">
                        <span className="material-symbols-outlined text-2xl text-outline">restaurant</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-headline-sm text-headline-sm text-on-surface font-bold">{item.name}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Qty: {item.quantity} × Rs. {item.price.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-headline-sm text-headline-sm text-on-surface font-bold">Rs. {item.lineTotal.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-space-lg">Order Summary</h2>
                <div className="space-y-3 mb-space-lg">
                  <div className="flex justify-between font-body-md text-body-md">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span className="text-on-surface font-semibold">Rs. {order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-body-md text-body-md">
                    <span className="text-on-surface-variant">Delivery Charge</span>
                    <span className="text-on-surface font-semibold">Rs. {order.deliveryCharge.toLocaleString()}</span>
                  </div>
                  <div className="h-[1px] bg-outline-variant"></div>
                  <div className="flex justify-between font-headline-md text-headline-md font-bold">
                    <span className="text-on-surface">Total</span>
                    <span className="text-primary">Rs. {order.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-tertiary-fixed/20 text-on-tertiary-fixed p-space-sm rounded-lg text-center font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px] inline-block mr-1">verified</span>
                  All prices include taxes
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-space-sm">
                <Button variant="primary" fullWidth className="sm:w-auto" onClick={handleReset}>
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  Track Another Order
                </Button>
                <Button variant="outline" fullWidth className="sm:w-auto" onClick={() => window.print()}>
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  Print Receipt
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}