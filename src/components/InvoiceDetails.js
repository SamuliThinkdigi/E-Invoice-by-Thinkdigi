import React, { useState } from 'react';
import { format } from 'date-fns';
import InvoiceForm from './InvoiceForm';

const InvoiceDetails = ({ invoice, onEdit, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(invoice.status);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    onEdit({ status: newStatus });
  };

  const handleEditSubmit = (updatedData) => {
    onEdit(updatedData);
    setIsEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateItemTotal = (item) => {
    // Fixed: Handle invalid numbers properly
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return quantity * price;
  };

  if (isEditing) {
    return (
      <InvoiceForm
        invoice={invoice}
        onSubmit={handleEditSubmit}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="invoice-details">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to List
        </button>
        <div>
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            Edit Invoice
          </button>
          <button className="btn btn-secondary" onClick={handlePrint}>
            Print
          </button>
        </div>
      </div>

      <div className="invoice-header">
        <div>
          <h1 style={{ color: '#2c3e50', margin: 0 }}>INVOICE</h1>
          <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>#{invoice.invoiceNumber}</p>
        </div>
        <div className="company-info">
          <h3 style={{ margin: 0 }}>ThinkDigi Solutions</h3>
          <p style={{ margin: '0.25rem 0' }}>123 Business Street</p>
          <p style={{ margin: '0.25rem 0' }}>City, State 12345</p>
          <p style={{ margin: '0.25rem 0' }}>contact@thinkdigi.com</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <h3>Bill To:</h3>
          <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px' }}>
            <p style={{ margin: '0.25rem 0', fontWeight: 'bold' }}>{invoice.customerName}</p>
            <p style={{ margin: '0.25rem 0' }}>{invoice.customerEmail}</p>
            {invoice.customerAddress && (
              <p style={{ margin: '0.25rem 0', whiteSpace: 'pre-line' }}>{invoice.customerAddress}</p>
            )}
          </div>
        </div>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <h4>Issue Date:</h4>
              <p>{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <h4>Due Date:</h4>
              <p>{formatDate(invoice.dueDate)}</p>
            </div>
            <div>
              <h4>Status:</h4>
              <select 
                value={status} 
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <h4>Created:</h4>
              <p>{formatDate(invoice.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style={{ textAlign: 'center' }}>Quantity</th>
            <th style={{ textAlign: 'right' }}>Unit Price</th>
            <th style={{ textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={item.id || index}>
              <td>{item.description}</td>
              <td style={{ textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right' }}>${item.price.toFixed(2)}</td>
              <td style={{ textAlign: 'right' }}>${calculateItemTotal(item).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-summary">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', maxWidth: '300px', marginLeft: 'auto' }}>
          <div>Subtotal:</div>
          <div>${invoice.subtotal?.toFixed(2) || '0.00'}</div>
          
          <div>Tax ({invoice.tax}%):</div>
          <div>${invoice.taxAmount?.toFixed(2) || '0.00'}</div>
          
          <div style={{ borderTop: '2px solid #2c3e50', paddingTop: '0.5rem' }} className="total">
            <strong>Total:</strong>
          </div>
          <div style={{ borderTop: '2px solid #2c3e50', paddingTop: '0.5rem' }} className="total">
            <strong>${invoice.total?.toFixed(2) || '0.00'}</strong>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h4>Notes:</h4>
          <p style={{ whiteSpace: 'pre-line', margin: '0.5rem 0 0 0' }}>{invoice.notes}</p>
        </div>
      )}

      <div style={{ marginTop: '3rem', textAlign: 'center', color: '#666', fontSize: '0.875rem' }}>
        <p>Thank you for your business!</p>
        <p>Payment is due within 30 days of invoice date.</p>
      </div>
    </div>
  );
};

export default InvoiceDetails;