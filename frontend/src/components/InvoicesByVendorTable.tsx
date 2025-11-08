import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Invoice {
  id: string;
  invoiceId: string;
  vendor: string;
  date: string;
  amount: number;
  status: string;
}

interface InvoicesByVendorTableProps {
  data: Invoice[];
  loading: boolean;
}

export const InvoicesByVendorTable = ({ data, loading }: InvoicesByVendorTableProps) => {
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">Invoices by Vendor</CardTitle>
          <p className="text-xs text-gray-500">Top vendors by invoice count and net value</p>
        </CardHeader>
        <CardContent>
          <div className="h-[240px] flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allData = data
    .filter(invoice => invoice.vendor && invoice.amount)
    .slice(0, 10)
    .map(invoice => ({
      vendor: invoice.vendor,
      date: invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB') : '-',
      value: invoice.amount,
    }));

  const displayData = showAll ? allData : allData.slice(0, 5);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">Invoices by Vendor</CardTitle>
        <p className="text-xs text-gray-500">Top vendors by invoice count and net value</p>
      </CardHeader>
      <CardContent className="overflow-hidden" style={{ overflowY: 'hidden' }}>
        <div style={{ overflowY: 'hidden', overflowX: 'hidden' }}>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="text-xs font-semibold text-gray-600">Vendor</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-center">Date</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-right">Net Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((row, index) => (
                <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <TableCell className="text-xs text-gray-700 py-3">{row.vendor}</TableCell>
                  <TableCell className="text-xs text-gray-700 text-center">{row.date}</TableCell>
                  <TableCell className="text-xs font-semibold text-gray-900 text-right">
                    {new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 2
                    }).format(row.value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {allData.length > 5 && (
          <div className="mt-3 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show All ({allData.length - 5} more)
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
