import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersApi } from '../../api/orders';
import { Button } from '../../components/common/Button';

export function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const data = await ordersApi.getOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-20rem)]">
        <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg py-space-xl flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-space-md">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-body-lg text-body-lg text-on-surface-variant">Loading order details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-20rem)]">
        <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg py-space-xl flex flex-col items-center justify-center h-[60vh] text-center">
          <span className="material-symbols-outlined text-6xl mb-space-md text-error">error</span>
          <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold mb-space-sm">Order Not Found</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-lg max-w-md">
            {error || 'Unable to load order details. The order ID may be invalid.'}
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
        <div className="text-center mb-space-xl">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-tertiary-fixed text-on-tertiary-fixed mb-space-lg">
            <span className="material-symbols-outlined text-[48px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold mb-space-sm">Order Confirmed!</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Thank you for your order. We're already preparing your delicious Karachi meal.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter-lg">
          <div className="lg:col-span-2 space-y-space-lg">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md text-on-surface-variant font-body-md text-body-md">
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Branch</p>
                  <p className="font-body-md text-body-md text-on-surface font-semibold">{order.branch}</p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Placed On</p>
                  <p className="font-body-md text-body-md text-on-surface font-semibold">{new Date(order.createdAt).toLocaleString()}</p>
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
          </div>

          <div className="lg:col-span-1">
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm sticky top-24">
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

              <div className="bg-tertiary-fixed/20 text-on-tertiary-fixed p-space-sm rounded-lg mb-space-md text-center font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[16px] inline-block mr-1">verified</span>
                All prices include taxes
              </div>

              <div className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
                <p className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
                  Order ID: <span className="font-mono font-bold text-on-surface">{order.orderId}</span>
                </p>
                <p className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">schedule</span>
                  Estimated delivery: 35-50 minutes
                </p>
                <p className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">local_shipping</span>
                  Track your order anytime using the Order ID
                </p>
              </div>

              <div className="mt-space-lg pt-space-lg border-t border-outline-variant">
                <Link to="/menu">
                  <Button variant="primary" fullWidth>
                    <span className="material-symbols-outlined text-[18px]">restaurant</span>
                    Order Again
                  </Button>
                </Link>
                <Link to="/track-order" className="mt-space-sm block">
                  <Button variant="outline" fullWidth>
                    <span className="material-symbols-outlined text-[18px]">track_changes</span>
                    Track Order
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}