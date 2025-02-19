import { AdminDashboardStats } from "@/types/order";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface AdminDashboardProps {
  stats: AdminDashboardStats;
}

export default function AdminDashboard({ stats }: AdminDashboardProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Total Orders</h2>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Link 
            href="/admin/orders"
            className="text-blue-600 hover:text-blue-800"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Order ID</th>
                <th className="text-left py-2">Customer</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Total</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">
                    <Link 
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {order.id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="py-2">{order.user.name || order.user.email}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      order.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                      order.status === "PROCESSING" ? "bg-blue-100 text-blue-800" :
                      order.status === "SHIPPED" ? "bg-purple-100 text-purple-800" :
                      order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2">{formatCurrency(order.total)}</td>
                  <td className="py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popular Products */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Popular Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Product</th>
                <th className="text-left py-2">Orders</th>
                <th className="text-left py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.popularProducts.map((product) => (
                <tr key={product.productId} className="border-b hover:bg-gray-50">
                  <td className="py-2">{product.title}</td>
                  <td className="py-2">{product.totalOrders}</td>
                  <td className="py-2">{formatCurrency(product.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Admin Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Actions</h2>
        <div className="space-y-4">
          {stats.recentActions.map((action) => (
            <div key={action.id} className="border-b pb-4">
              <p className="text-sm text-gray-600">
                {new Date(action.createdAt).toLocaleString()}
              </p>
              <p className="font-medium">{action.user.name || action.user.email}</p>
              <p>{action.action}: {action.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
