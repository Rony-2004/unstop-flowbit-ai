import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CategorySpend {
  category: string;
  spend: number;
}

interface SpendByCategoryChartProps {
  data: CategorySpend[];
  loading: boolean;
}

const COLORS = ["#2563eb", "#f97316", "#14b8a6"];

export const SpendByCategoryChart = ({ data, loading }: SpendByCategoryChartProps) => {
  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">Spend by Category</CardTitle>
          <p className="text-xs text-gray-500">Distribution of spending across different categories</p>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.slice(0, 3).map((item, index) => ({
    name: item.category,
    value: item.spend,
    color: COLORS[index % COLORS.length],
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">Spend by Category</CardTitle>
        <p className="text-xs text-gray-500">Distribution of spending across different categories</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => 
                new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(value)
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-700">{item.name}</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(item.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
