'use client';

import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { EnhancedInvoiceTable } from "@/components/EnhancedInvoiceTable";
import { PaymentStatusChart } from "@/components/PaymentStatusChart";
import { MonthlyComparisonChart } from "@/components/MonthlyComparisonChart";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";

export default function InvoicesPage() {
  const { user, hasPermission } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const pageSize = 10;

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices', currentPage, searchQuery, statusFilter],
    queryFn: () => apiService.getInvoices(currentPage, pageSize, searchQuery, statusFilter),
    retry: 3,
  });

  const { data: paymentStatus, isLoading: paymentLoading } = useQuery({
    queryKey: ['payment-status'],
    queryFn: apiService.getPaymentStatus,
    retry: 3,
    enabled: hasPermission('view_analytics'),
  });

  const { data: invoiceTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['invoice-trends'],
    queryFn: apiService.getInvoiceTrends,
    retry: 3,
    enabled: hasPermission('view_analytics'),
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!hasPermission('view_invoices')) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <main className="flex-1 w-full overflow-x-hidden">
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Invoices</h1>
              <div className="flex items-center gap-2 sm:gap-3">
                <RoleSwitcher />
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-medium">
                    {user?.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h2>
              <p className="text-sm text-red-600">
                You don't have permission to view invoices. Please contact your administrator.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 w-full overflow-x-hidden">
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Invoice Management</h1>
              <p className="text-xs text-gray-500 mt-1">View, search, and manage all invoices</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <RoleSwitcher />
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-medium">
                  {user?.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Analytics Charts - Only for users with analytics permission */}
          {hasPermission('view_analytics') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <MonthlyComparisonChart data={invoiceTrends || []} loading={trendsLoading} />
              <PaymentStatusChart data={paymentStatus || []} loading={paymentLoading} />
            </div>
          )}

          {/* Enhanced Invoice Table with Search and Filters */}
          <EnhancedInvoiceTable
            data={invoicesData?.invoices || []}
            loading={invoicesLoading}
            total={invoicesData?.total || 0}
            currentPage={currentPage}
            pageSize={pageSize}
            onSearch={handleSearch}
            onFilter={handleFilter}
            onPageChange={handlePageChange}
          />

          {/* Role-based info message */}
          {user?.role === 'viewer' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Viewer Mode:</strong> You have read-only access to invoices. Switch to Manager or Admin role to edit or delete invoices.
              </p>
            </div>
          )}

          {user?.role === 'manager' && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Manager Mode:</strong> You can view and edit invoices. Admin privileges required to delete invoices or manage users.
              </p>
            </div>
          )}

          {user?.role === 'admin' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Admin Mode:</strong> You have full access to all invoice management features including view, edit, delete, and user management.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
