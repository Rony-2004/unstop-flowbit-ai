import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface MonthlyComparisonChartProps {
  data: Array<{ month: string; volume: number; value: number }>;
  loading?: boolean;
}

export const MonthlyComparisonChart = ({ data, loading }: MonthlyComparisonChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Volume vs Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Monthly Volume vs Value</CardTitle>
        <p className="text-xs text-muted-foreground">Invoice count and total value by month</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="volume" fill="#8b5cf6" name="Invoice Count" />
            <Bar yAxisId="right" dataKey="value" fill="#10b981" name="Total Value (EUR)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
