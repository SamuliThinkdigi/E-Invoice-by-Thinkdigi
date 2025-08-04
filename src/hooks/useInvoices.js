import { useState, useEffect, useCallback } from 'react';

// Custom hook for invoice management with improved error handling and performance
export const useInvoices = (showToast) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load invoices from localStorage on mount
  useEffect(() => {
    setLoading(true);
    try {
      const savedInvoices = localStorage.getItem('invoices');
      if (savedInvoices) {
        const parsedInvoices = JSON.parse(savedInvoices);
        setInvoices(parsedInvoices);
      }
    } catch (err) {
      setError('Failed to load invoices from storage');
      console.error('Error loading invoices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save invoices to localStorage whenever invoices change
  useEffect(() => {
    if (invoices.length > 0) {
      try {
        localStorage.setItem('invoices', JSON.stringify(invoices));
      } catch (err) {
        setError('Failed to save invoices to storage');
        console.error('Error saving invoices:', err);
      }
    }
  }, [invoices]);

  // Create invoice with better error handling
  const createInvoice = useCallback((invoiceData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newInvoice = {
        ...invoiceData,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        status: 'draft'
      };
      
      setInvoices(prevInvoices => [...prevInvoices, newInvoice]);
      showToast?.showSuccess('Invoice created successfully!');
      return { success: true, invoice: newInvoice };
    } catch (err) {
      setError('Failed to create invoice');
      showToast?.showError('Failed to create invoice');
      console.error('Error creating invoice:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Update invoice
  const updateInvoice = useCallback((id, updatedData) => {
    setLoading(true);
    setError(null);
    
    try {
      setInvoices(prevInvoices => 
        prevInvoices.map(invoice => 
          invoice.id === id ? { ...invoice, ...updatedData } : invoice
        )
      );
      showToast?.showSuccess('Invoice updated successfully!');
      return { success: true };
    } catch (err) {
      setError('Failed to update invoice');
      showToast?.showError('Failed to update invoice');
      console.error('Error updating invoice:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Delete invoice
  const deleteInvoice = useCallback((id) => {
    setLoading(true);
    setError(null);
    
    try {
      setInvoices(prevInvoices => 
        prevInvoices.filter(invoice => invoice.id !== id)
      );
      showToast?.showSuccess('Invoice deleted successfully!');
      return { success: true };
    } catch (err) {
      setError('Failed to delete invoice');
      showToast?.showError('Failed to delete invoice');
      console.error('Error deleting invoice:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Export invoices
  const exportInvoices = useCallback(() => {
    try {
      const data = JSON.stringify(invoices, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoices-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast?.showSuccess(`Exported ${invoices.length} invoices successfully!`);
      return { success: true };
    } catch (err) {
      setError('Failed to export invoices');
      showToast?.showError('Failed to export invoices');
      console.error('Error exporting invoices:', err);
      return { success: false, error: err.message };
    }
  }, [invoices, showToast]);

  // Import invoices
  const importInvoices = useCallback((file) => {
    setLoading(true);
    setError(null);
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          if (Array.isArray(importedData)) {
            setInvoices(importedData);
            showToast?.showSuccess(`Imported ${importedData.length} invoices successfully!`);
            resolve({ success: true, count: importedData.length });
          } else {
            throw new Error('Invalid file format');
          }
        } catch (err) {
          setError('Failed to import invoices');
          showToast?.showError('Failed to import invoices. Please check the file format.');
          console.error('Error importing invoices:', err);
          resolve({ success: false, error: err.message });
        } finally {
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read file');
        showToast?.showError('Failed to read file');
        setLoading(false);
        resolve({ success: false, error: 'Failed to read file' });
      };
      
      reader.readAsText(file);
    });
  }, [showToast]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    invoices,
    loading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    exportInvoices,
    importInvoices,
    clearError
  };
};