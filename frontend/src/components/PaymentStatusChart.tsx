import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface PaymentStatusChartProps {
  data: Array<{ status: string; count: number }>;
  loading?: boolean;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const STATUS_LABELS: { [key: string]: string } = {
  'processed': 'Processed',
  'pending': 'Pending',
  'failed': 'Failed',
  'Processed': 'Processed',
  'Pending': 'Pending',
  'Failed': 'Failed',
};

export const PaymentStatusChart = ({ data, loading }: PaymentStatusChartProps) => {
  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">Payment Status Distribution</CardTitle>
          <p className="text-xs text-gray-500">Invoice status breakdown</p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  
  const chartData = data.map((item, index) => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    percentage: ((item.count / totalCount) * 100).toFixed(1),
    color: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm text-gray-900">{payload[0].name}</p>
          <p className="text-xs text-gray-600 mt-1">
            Count: {payload[0].value}
          </p>
          <p className="text-xs text-gray-600">
            {payload[0].payload.percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">Payment Status Distribution</CardTitle>
        <p className="text-xs text-gray-500">Invoice status breakdown</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-700 truncate" title={item.name}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3 ml-2">
                <span className="text-xs text-gray-600">
                  {item.value}
                </span>
                <span className="text-xs font-semibold text-gray-900 w-12 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
