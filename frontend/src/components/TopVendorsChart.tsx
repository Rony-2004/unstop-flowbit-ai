import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface VendorData {
  vendorName: string;
  totalSpend: number;
}

interface TopVendorsChartProps {
  data: VendorData[];
  loading: boolean;
}

export const TopVendorsChart = ({ data, loading }: TopVendorsChartProps) => {
  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Spend by Vendor (Top 10)</CardTitle>
          <p className="text-sm text-muted-foreground">Vendor spend with cumulative percentage distribution.</p>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Spend by Vendor (Top 10)</CardTitle>
          <p className="text-sm text-muted-foreground">Vendor spend with cumulative percentage distribution.</p>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] flex items-center justify-center">
            <div className="text-muted-foreground">No vendor data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedData = [...data].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 10);
  const maxSpend = Math.max(...sortedData.map(v => v.totalSpend));

  const colors = [
    '#4f46e5', // indigo-600
    '#6366f1', // indigo-500
    '#818cf8', // indigo-400
    '#a5b4fc', // indigo-300
    '#c7d2fe', // indigo-200
    '#e0e7ff', // indigo-100
    '#dbeafe', // blue-100
    '#bfdbfe', // blue-200
    '#93c5fd', // blue-300
    '#60a5fa', // blue-400
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Spend by Vendor (Top 10)</CardTitle>
        <p className="text-sm text-muted-foreground">Vendor spend with cumulative percentage distribution.</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-2">
          {sortedData.map((vendor, index) => {
            const percentage = (vendor.totalSpend / maxSpend) * 100;
            
            return (
              <div key={index} className="relative group">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-700 font-medium text-right w-36 flex-shrink-0" title={vendor.vendorName}>
                    {vendor.vendorName}
                  </span>
                  <div className="flex-1 relative h-5">
                    {/* Background bar - full width */}
                    <div className="absolute inset-0 bg-gray-200 rounded-r"></div>
                    {/* Actual spend bar */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-r transition-all duration-300 group-hover:opacity-80"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: colors[index]
                      }}
                    ></div>
                    {/* Tooltip on hover */}
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white border border-gray-300 rounded-lg shadow-lg px-2 py-1.5 pointer-events-none whitespace-nowrap">
                      <p className="font-semibold text-xs">{vendor.vendorName}</p>
                      <p className="text-xs text-indigo-600 font-medium">
                        Vendor Spend: €{vendor.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500 pl-40">
          <span>€0k</span>
          <span>€{(maxSpend / 4000).toFixed(0)}k</span>
          <span>€{(maxSpend / 2000).toFixed(0)}k</span>
          <span>€{(maxSpend * 3 / 4000).toFixed(0)}k</span>
          <span>€{(maxSpend / 1000).toFixed(0)}k</span>
        </div>
      </CardContent>
    </Card>
  );
};
