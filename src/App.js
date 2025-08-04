import React, { useState, useEffect } from 'react';
import InvoiceForm from './components/InvoiceForm';
import InvoiceList from './components/InvoiceList';
import InvoiceDetails from './components/InvoiceDetails';

function App() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'create', 'details'

  // Load invoices from localStorage on component mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
  }, []);

  // Save invoices to localStorage whenever invoices change
  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  const handleCreateInvoice = (invoiceData) => {
    const newInvoice = {
      ...invoiceData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Fixed: More unique ID generation
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
    setInvoices([...invoices, newInvoice]);
    setView('list');
  };

  const handleEditInvoice = (id, updatedData) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === id ? { ...invoice, ...updatedData } : invoice
    ));
    setView('list');
  };

  const handleDeleteInvoice = (id) => {
    setInvoices(invoices.filter(invoice => invoice.id !== id));
    if (selectedInvoice && selectedInvoice.id === id) {
      setSelectedInvoice(null);
      setView('list');
    }
  };

  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setView('details');
  };

  return (
    <div className="App">
      <div className="header">
        <div className="container">
          <h1>E-Invoice Management System</h1>
        </div>
      </div>
      
      <div className="container">
        <div style={{ marginBottom: '1rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => setView('create')}
          >
            Create New Invoice
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => setView('list')}
          >
            View All Invoices
          </button>
        </div>

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
            onDelete={handleDeleteInvoice}
          />
        )}

        {view === 'details' && selectedInvoice && (
          <InvoiceDetails 
            invoice={selectedInvoice}
            onEdit={(updatedData) => handleEditInvoice(selectedInvoice.id, updatedData)}
            onBack={() => setView('list')}
          />
        )}
      </div>
    </div>
  );
}

export default App;