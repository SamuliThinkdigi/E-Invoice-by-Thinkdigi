import React, { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';

const InvoiceList = React.memo(({ invoices, onSelect, onDelete }) => {
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  const filteredAndSortedInvoices = useMemo(() => invoices
    .filter(invoice => {
      if (filterStatus === 'all') return true;
      return invoice.status === filterStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'total') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      
      if (sortBy === 'createdAt' || sortBy === 'dueDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    }), [invoices, filterStatus, sortBy, sortOrder]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return '#95a5a6';
      case 'sent': return '#3498db';
      case 'paid': return '#27ae60';
      case 'overdue': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Fixed: Return a fallback for invalid dates
        return 'Invalid Date';
      }
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      // Fixed: Better error handling for invalid dates
      return 'Invalid Date';
    }
  };

  const handleDelete = useCallback((e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      onDelete(id);
    }
  }, [onDelete]);

  return (
    <div className="invoice-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Invoice List ({filteredAndSortedInvoices.length})</h2>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div>
            <label htmlFor="statusFilter" style={{ marginRight: '0.5rem' }}>Filter by Status:</label>
            <select 
              id="statusFilter"
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '0.25rem' }}
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {filteredAndSortedInvoices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          {invoices.length === 0 ? 'No invoices created yet.' : 'No invoices match the current filter.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th 
                  style={{ padding: '0.75rem', textAlign: 'left', cursor: 'pointer', borderBottom: '2px solid #dee2e6' }}
                  onClick={() => handleSort('invoiceNumber')}
                >
                  Invoice # {sortBy === 'invoiceNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  style={{ padding: '0.75rem', textAlign: 'left', cursor: 'pointer', borderBottom: '2px solid #dee2e6' }}
                  onClick={() => handleSort('customerName')}
                >
                  Customer {sortBy === 'customerName' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  style={{ padding: '0.75rem', textAlign: 'left', cursor: 'pointer', borderBottom: '2px solid #dee2e6' }}
                  onClick={() => handleSort('createdAt')}
                >
                  Created {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  style={{ padding: '0.75rem', textAlign: 'left', cursor: 'pointer', borderBottom: '2px solid #dee2e6' }}
                  onClick={() => handleSort('dueDate')}
                >
                  Due Date {sortBy === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  style={{ padding: '0.75rem', textAlign: 'right', cursor: 'pointer', borderBottom: '2px solid #dee2e6' }}
                  onClick={() => handleSort('total')}
                >
                  Total {sortBy === 'total' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>
                  Status
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedInvoices.map((invoice) => (
                <tr 
                  key={invoice.id}
                  style={{ 
                    borderBottom: '1px solid #dee2e6',
                    cursor: 'pointer',
                    ':hover': { backgroundColor: '#f8f9fa' }
                  }}
                  onClick={() => onSelect(invoice)}
                >
                  <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>
                    {invoice.invoiceNumber}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {invoice.customerName}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {formatDate(invoice.createdAt)}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                    ${invoice.total?.toFixed(2) || '0.00'}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <span 
                      style={{ 
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: getStatusColor(invoice.status),
                        textTransform: 'uppercase'
                      }}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={(e) => handleDelete(e, invoice.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export default InvoiceList;