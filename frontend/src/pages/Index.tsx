import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { InvoiceVolumeChart } from "@/components/InvoiceVolumeChart";
import { SpendByCategoryChart } from "@/components/SpendByCategoryChart";
import { CashOutflowChart } from "@/components/CashOutflowChart";
import { InvoicesByVendorTable } from "@/components/InvoicesByVendorTable";
import { TopVendorsChart } from "@/components/TopVendorsChart";
import { apiService } from "@/services/api";

const Index = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['stats'],
    queryFn: apiService.getStats,
    retry: 3,
    staleTime: 30000,
  });

  const { data: invoiceTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['invoice-trends'],
    queryFn: apiService.getInvoiceTrends,
    retry: 3,
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: apiService.getTopVendors,
    retry: 3,
  });

  const { data: categorySpend, isLoading: categoryLoading } = useQuery({
    queryKey: ['category-spend'],
    queryFn: apiService.getCategorySpend,
    retry: 3,
  });

  const { data: cashOutflow, isLoading: cashLoading } = useQuery({
    queryKey: ['cash-outflow'],
    queryFn: apiService.getCashOutflow,
    retry: 3,
  });

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => apiService.getInvoices(1, 10),
    retry: 3,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 w-full overflow-x-hidden">
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Dashboard</h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-medium">MA</span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">Mowazzem Uddin Ahmed</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              title="Total Spend"
              subtitle="(YTD)"
              value={statsLoading ? "Loading..." : formatCurrency(stats?.totalSpend || 0)}
              change="+8.2%"
              trend="up"
              period="from last month"
            />
            <StatCard
              title="Total Invoices Processed"
              subtitle=""
              value={statsLoading ? "Loading..." : formatNumber(stats?.totalInvoices || 0)}
              change="+8.2%"
              trend="up"
              period="from last month"
            />
            <StatCard
              title="Documents Uploaded"
              subtitle="This Month"
              value={statsLoading ? "Loading..." : formatNumber(stats?.totalDocuments || 0)}
              change="+9.6%"
              trend="down"
              period="from last month"
            />
            <StatCard
              title="Average Invoice Value"
              subtitle=""
              value={statsLoading ? "Loading..." : formatCurrency(stats?.averageInvoiceValue || 0)}
              change="+9.6%"
              trend="down"
              period="This Month"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="lg:col-span-1">
              <InvoiceVolumeChart data={invoiceTrends || []} loading={trendsLoading} />
            </div>
            <div className="lg:col-span-1">
              <TopVendorsChart data={vendors || []} loading={vendorsLoading} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <SpendByCategoryChart data={categorySpend || []} loading={categoryLoading} />
            <CashOutflowChart data={cashOutflow || []} loading={cashLoading} />
            <InvoicesByVendorTable data={invoicesData?.invoices || []} loading={invoicesLoading} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
