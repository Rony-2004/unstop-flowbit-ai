import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
          <CardTitle className="text-base font-semibold text-gray-900">Invoice Volume + Value Trend</CardTitle>
          <p className="text-xs text-gray-500">Invoice count and total spend over 12 months</p>
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
        <CardTitle className="text-base font-semibold text-gray-900">Invoice Volume + Value Trend</CardTitle>
        <p className="text-xs text-gray-500">Invoice count and total spend over 12 months</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              stroke="#d1d5db"
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11 }}
              stroke="#d1d5db"
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px"
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: "12px" }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#colorVolume)"
              name="Invoice count"
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorValue)"
              name="Total Spend"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
