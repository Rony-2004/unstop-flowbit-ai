'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Search, ChevronLeft, ChevronRight, Trash2, Edit, MoreVertical } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";

interface Invoice {
  id: string;
  invoiceId: string;
  vendor: string;
  date: string;
  amount: number;
  status: string;
  customer?: string;
}

interface EnhancedInvoiceTableProps {
  data: Invoice[];
  loading: boolean;
  total?: number;
  onSearch?: (query: string) => void;
  onFilter?: (status: string) => void;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  pageSize?: number;
}

export const EnhancedInvoiceTable = ({ 
  data, 
  loading,
  total = 0,
  onSearch,
  onFilter,
  onPageChange,
  currentPage = 1,
  pageSize = 10
}: EnhancedInvoiceTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const canEdit = hasPermission('edit_invoices');
  const canDelete = hasPermission('delete_invoices');

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (invoiceId: string) => apiService.deleteInvoice(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive",
      });
      console.error('Delete error:', error);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) => 
      apiService.updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
      setEditDialogOpen(false);
      setInvoiceToEdit(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      });
      console.error('Update error:', error);
    },
  });

  const handleSearch = () => {
    onSearch?.(searchQuery);
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    onFilter?.(value === 'all' ? '' : value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (invoiceToDelete) {
      deleteMutation.mutate(invoiceToDelete.id);
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setInvoiceToEdit(invoice);
    setEditStatus(invoice.status);
    setEditDialogOpen(true);
  };

  const handleEditConfirm = () => {
    if (invoiceToEdit) {
      updateMutation.mutate({
        id: invoiceToEdit.id,
        data: { status: editStatus },
      });
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">Invoice Management</CardTitle>
          <p className="text-xs text-gray-500">Search and filter invoices</p>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading invoices...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">Invoice Management</CardTitle>
            <p className="text-xs text-gray-500">Search, filter and manage all invoices</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by vendor, invoice ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full sm:w-[150px] text-sm">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} size="sm" className="text-sm">
              Search
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="text-xs font-semibold text-gray-600">Invoice ID</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Vendor</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Customer</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Date</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-right">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-center">Status</TableHead>
                {(canEdit || canDelete) && (
                  <TableHead className="text-xs font-semibold text-gray-600 text-center">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit || canDelete ? 7 : 6} className="text-center py-8 text-gray-500">
                    No invoices found. Try adjusting your search or filters.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((invoice) => (
                  <TableRow key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="text-xs text-gray-700 py-3 font-medium">
                      {invoice.invoiceId || '-'}
                    </TableCell>
                    <TableCell className="text-xs text-gray-700">{invoice.vendor || '-'}</TableCell>
                    <TableCell className="text-xs text-gray-700">{invoice.customer || '-'}</TableCell>
                    <TableCell className="text-xs text-gray-700">
                      {invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB') : '-'}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-gray-900 text-right">
                      {invoice.amount ? new Intl.NumberFormat('de-DE', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 2
                      }).format(invoice.amount) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`text-xs ${getStatusColor(invoice.status)}`} variant="secondary">
                        {invoice.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    {(canEdit || canDelete) && (
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEdit && (
                              <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(invoice)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total} invoices
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-xs text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete invoice <strong>{invoiceToDelete?.invoiceId}</strong> from <strong>{invoiceToDelete?.vendor}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>
              Update the status for invoice <strong>{invoiceToEdit?.invoiceId}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Vendor:</strong> {invoiceToEdit?.vendor}</p>
              <p><strong>Amount:</strong> {invoiceToEdit?.amount ? new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
              }).format(invoiceToEdit.amount) : '-'}</p>
              <p><strong>Date:</strong> {invoiceToEdit?.date ? new Date(invoiceToEdit.date).toLocaleDateString('en-GB') : '-'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditConfirm}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
