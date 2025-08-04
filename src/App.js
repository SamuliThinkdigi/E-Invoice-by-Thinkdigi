import React, { useState, useCallback } from 'react';
import InvoiceForm from './components/InvoiceForm';
import InvoiceList from './components/InvoiceList';
import InvoiceDetails from './components/InvoiceDetails';
import ConfirmationModal from './components/ConfirmationModal';
import LoadingSpinner, { FullPageLoader } from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { useToast } from './contexts/ToastContext';
import { useInvoices } from './hooks/useInvoices';

function App() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'create', 'details'
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, invoiceId: null });
  const [fileInputRef, setFileInputRef] = useState(null);
  
  const toast = useToast();
  const {
    invoices,
    loading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    exportInvoices,
    importInvoices,
    clearError
  } = useInvoices(toast);

  const handleCreateInvoice = useCallback((invoiceData) => {
    const result = createInvoice(invoiceData);
    if (result.success) {
      setView('list');
    }
  }, [createInvoice]);

  const handleEditInvoice = useCallback((id, updatedData) => {
    const result = updateInvoice(id, updatedData);
    if (result.success) {
      setView('list');
      // Update selected invoice if it's currently being viewed
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice({ ...selectedInvoice, ...updatedData });
      }
    }
  }, [updateInvoice, selectedInvoice]);

  const handleDeleteClick = useCallback((id) => {
    setConfirmModal({ isOpen: true, invoiceId: id });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (confirmModal.invoiceId) {
      const result = deleteInvoice(confirmModal.invoiceId);
      if (result.success) {
        if (selectedInvoice && selectedInvoice.id === confirmModal.invoiceId) {
          setSelectedInvoice(null);
          setView('list');
        }
      }
    }
    setConfirmModal({ isOpen: false, invoiceId: null });
  }, [confirmModal.invoiceId, deleteInvoice, selectedInvoice]);

  const handleCancelDelete = useCallback(() => {
    setConfirmModal({ isOpen: false, invoiceId: null });
  }, []);

  const handleSelectInvoice = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setView('details');
  }, []);

  const handleExportInvoices = useCallback(() => {
    exportInvoices();
  }, [exportInvoices]);

  const handleImportInvoices = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      importInvoices(file);
      // Reset the file input
      event.target.value = '';
    }
  }, [importInvoices]);

  const triggerFileInput = useCallback(() => {
    fileInputRef?.click();
  }, [fileInputRef]);

  if (loading && invoices.length === 0) {
    return <FullPageLoader text="Loading invoices..." />;
  }

  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <div className="App">
        <div className="header">
          <div className="container">
            <h1>E-Invoice Management System</h1>
          </div>
        </div>
        
        <div className="container">
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{error}</span>
              <button
                onClick={clearError}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '0 4px'
                }}
              >
                ×
              </button>
            </div>
          )}

          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => setView('create')}
              disabled={loading}
            >
              Create New Invoice
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setView('list')}
              disabled={loading}
            >
              View All Invoices
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleExportInvoices}
              disabled={loading || invoices.length === 0}
            >
              Export Data
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={triggerFileInput}
              disabled={loading}
            >
              Import Data
            </button>
          </div>

          <input
            type="file"
            ref={setFileInputRef}
            onChange={handleImportInvoices}
            accept=".json"
            style={{ display: 'none' }}
          />

          {loading && view !== 'list' && (
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <LoadingSpinner text="Processing..." />
            </div>
          )}

          {view === 'create' && (
            <InvoiceForm 
              onSubmit={handleCreateInvoice}
              onCancel={() => setView('list')}
            />
          )}

          {view === 'list' && (
            <InvoiceList 
              invoices={invoices}
              onSelect={handleSelectInvoice}
              onDelete={handleDeleteClick}
            />
          )}

          {view === 'details' && selectedInvoice && (
            <InvoiceDetails 
              invoice={selectedInvoice}
              onEdit={(updatedData) => handleEditInvoice(selectedInvoice.id, updatedData)}
              onBack={() => setView('list')}
            />
          )}

          <ConfirmationModal
            isOpen={confirmModal.isOpen}
            title="Delete Invoice"
            message="Are you sure you want to delete this invoice? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;