import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/admin';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, token, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ branch: '', date: '' });
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    } else {
      fetchOrders();
    }
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getOrders(filters);
      setOrders(response.orders || []);
    } catch (err) {
      if (err.status === 401) {
        logout();
        navigate('/admin/login');
      } else {
        setError(err.message || 'Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (updatingOrder === orderId) return;

    setUpdatingOrder(orderId);
    try {
      const updatedOrder = await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await adminApi.exportOrdersCsv(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message || 'Failed to export CSV');
    }
  };

  const getNextStatus = (currentStatus) => {
    const statuses = ['Received', 'Preparing', 'Out for Delivery', 'Delivered'];
    const currentIndex = statuses.indexOf(currentStatus);
    return currentIndex < statuses.length - 1 ? statuses[currentIndex + 1] : null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-tertiary-fixed text-on-tertiary-fixed';
      case 'Out for Delivery': return 'bg-primary-fixed text-on-primary-fixed';
      case 'Preparing': return 'bg-secondary-fixed text-on-secondary-fixed';
      default: return 'bg-surface-container-high text-on-surface';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="w-full pt-20 bg-surface min-h-[calc(100vh-20rem)] pb-margin-lg">
      <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg py-space-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-md mb-space-xl">
          <div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold">Admin Dashboard</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage orders and track deliveries</p>
          </div>
          <div className="flex items-center gap-space-sm">
            <Button variant="outline" onClick={handleExportCsv} size="sm">
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export CSV
            </Button>
            <Button variant="ghost" onClick={logout} size="sm">
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Logout
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm mb-space-lg">
          <form onSubmit={handleFilterSubmit} className="flex flex-col sm:flex-row gap-space-md items-end">
            <Input
              label="Branch"
              name="branch"
              value={filters.branch}
              onChange={handleFilterChange}
              placeholder="All branches"
              options={['Clifton', 'Gulshan-e-Iqbal', 'North Nazimabad'].map(b => ({ value: b, label: b }))}
            />
            <Input
              label="Date (YYYY-MM-DD)"
              name="date"
              type="date"
              value={filters.date}
              onChange={handleFilterChange}
              placeholder="All dates"
            />
            <div className="flex gap-space-sm">
              <Button type="submit" variant="primary" size="sm">
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                Filter
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setFilters({ branch: '', date: '' })}>
                Clear
              </Button>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-space-md rounded-xl mb-space-lg flex items-center gap-2 font-body-md text-body-md" role="alert">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {error}
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-space-xl text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-space-md" />
              <p className="font-body-lg text-body-lg text-on-surface-variant">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-space-xl text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-space-md block">receipt_long</span>
              <p className="font-body-lg text-body-lg">No orders found</p>
              <p className="font-body-sm text-body-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="px-space-md py-space-md text-left font-label-md text-label-md text-on-surface-variant">Order ID</th>
                    <th className="px-space-md py-space-md text-left font-label-md text-label-md text-on-surface-variant">Customer</th>
                    <th className="px-space-md py-space-md text-left font-label-md text-label-md text-on-surface-variant">Branch</th>
                    <th className="px-space-md py-space-md text-left font-label-md text-label-md text-on-surface-variant">Items</th>
                    <th className="px-space-md py-space-md text-right font-label-md text-label-md text-on-surface-variant">Total</th>
                    <th className="px-space-md py-space-md text-left font-label-md text-label-md text-on-surface-variant">Status</th>
                    <th className="px-space-md py-space-md text-left font-label-md text-label-md text-on-surface-variant">Placed</th>
                    <th className="px-space-md py-space-md text-left font-label-md text-label-md text-on-surface-variant">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-outline-variant/50 hover:bg-surface-container-low/50">
                      <td className="px-space-md py-space-md font-mono font-body-sm text-body-sm text-on-surface">{order.id}</td>
                      <td className="px-space-md py-space-md">
                        <p className="font-body-sm text-body-sm text-on-surface font-medium">{order.customer_name}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{order.mobile}</p>
                      </td>
                      <td className="px-space-md py-space-md font-body-sm text-body-sm text-on-surface">{order.branch}</td>
                      <td className="px-space-md py-space-md font-body-sm text-body-sm text-on-surface-variant">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-space-md py-space-md text-right font-body-md text-body-md text-on-surface font-semibold">Rs. {order.total.toLocaleString()}</td>
                      <td className="px-space-md py-space-md">
                        <span className={`inline-flex items-center gap-1 px-space-md py-1.5 rounded-full font-label-sm text-label-sm font-bold ${getStatusColor(order.status)}`}>
                          <span className={`w-2 h-2 rounded-full ${order.status === 'Delivered' ? 'bg-tertiary' : order.status === 'Out for Delivery' ? 'bg-primary animate-pulse' : order.status === 'Preparing' ? 'bg-secondary animate-pulse' : 'bg-outline'}`}></span>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-space-md py-space-md font-body-sm text-body-sm text-on-surface-variant">{new Date(order.created_at).toLocaleString()}</td>
                      <td className="px-space-md py-space-md">
                        {getNextStatus(order.status) && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status))}
                            loading={updatingOrder === order.id}
                          >
                            {updatingOrder === order.id ? (
                              <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                {getNextStatus(order.status)}
                              </>
                            )}
                          </Button>
                        )}
                        {order.status === 'Delivered' && (
                          <span className="font-body-sm text-body-sm text-tertiary">
                            <span className="material-symbols-outlined text-[16px] inline-block mr-1 align-middle">check_circle</span>
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Orders Count */}
        <div className="mt-space-md font-body-sm text-body-sm text-on-surface-variant">
          Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
        </div>
      </div>
    </main>
  );
}