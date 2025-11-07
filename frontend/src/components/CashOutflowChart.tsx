import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CashOutflow {
  month: string;
  amount: number;
}

interface CashOutflowChartProps {
  data: CashOutflow[];
  loading: boolean;
}

export const CashOutflowChart = ({ data, loading }: CashOutflowChartProps) => {
  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">Cash Outflow Forecast</CardTitle>
          <p className="text-xs text-gray-500">Expected payment obligations grouped by due date range</p>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    period: item.month,
    amount: Math.round(item.amount / 100), // Convert to hundreds for better display
  }));

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">Cash Outflow Forecast</CardTitle>
        <p className="text-xs text-gray-500">Expected payment obligations grouped by due date range</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px"
              }}
              formatter={(value: number) => [`€${(value * 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`, "Amount"]}
            />
            <Bar
              dataKey="amount"
              fill="#1e3a8a"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
