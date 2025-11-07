import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { InvoiceVolumeChart } from "@/components/InvoiceVolumeChart";
import { SpendByCategoryChart } from "@/components/SpendByCategoryChart";
import { CashOutflowChart } from "@/components/CashOutflowChart";
import { InvoicesByVendorTable } from "@/components/InvoicesByVendorTable";
import { TopVendorsChart } from "@/components/TopVendorsChart";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-semibold">AJ</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Amit Jadhav</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Spend"
              value="€ 12,679.25"
              change="+8.2%"
              trend="up"
              period="from last month"
            />
            <StatCard
              title="Total Invoices Processed"
              value="64"
              change="+8.2%"
              trend="up"
              period="from last month"
            />
            <StatCard
              title="Documents Uploaded"
              value="17"
              change="+9.6%"
              trend="down"
              period="from last month"
            />
            <StatCard
              title="Average Invoice Value"
              value="€ 2,455.00"
              change="+9.6%"
              trend="down"
              period="from last month"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <InvoiceVolumeChart />
            </div>
            <div>
              <TopVendorsChart />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SpendByCategoryChart />
            <CashOutflowChart />
            <InvoicesByVendorTable />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
