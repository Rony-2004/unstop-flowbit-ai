import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface InvoiceTrend {
  month: string;
  volume: number;
  value: number;
}

interface InvoiceVolumeChartProps {
  data: InvoiceTrend[];
  loading: boolean;
}

export const InvoiceVolumeChart = ({ data, loading }: InvoiceVolumeChartProps) => {
  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">Monthly Volume vs Value</CardTitle>
          <p className="text-xs text-gray-500">Invoice count and total value by month</p>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">Monthly Volume vs Value</CardTitle>
        <p className="text-xs text-gray-500">Invoice count and total value by month</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px"
              }}
              formatter={(value: number, name: string) => {
                if (name === "Invoice Count") return [value, name];
                return [`€${value.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`, "Total Value (EUR)"];
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              iconType="line"
            />
            <Bar
              yAxisId="left"
              dataKey="volume"
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              name="Invoice Count"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              name="Total Value (EUR)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
