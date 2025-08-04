import React, { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';

const InvoiceList = React.memo(({ invoices, onSelect, onDelete }) => {
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

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
      // Status filter
      if (filterStatus !== 'all' && invoice.status !== filterStatus) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
          invoice.customerName.toLowerCase().includes(searchLower) ||
          invoice.customerEmail.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Date range filter
      if (dateRange.start || dateRange.end) {
        const invoiceDate = new Date(invoice.createdAt);
        if (dateRange.start && invoiceDate < new Date(dateRange.start)) {
          return false;
        }
        if (dateRange.end && invoiceDate > new Date(dateRange.end)) {
          return false;
        }
      }
      
      return true;
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
          }), [invoices, filterStatus, searchTerm, dateRange, sortBy, sortOrder]);

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
    onDelete(id);
  }, [onDelete]);

  return (
    <div className="invoice-list">
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Invoice List ({filteredAndSortedInvoices.length})</h2>
        </div>
        
        {/* Enhanced Filters */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '1rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div>
            <label htmlFor="searchInput" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Search Invoices:
            </label>
            <input
              id="searchInput"
              type="text"
              placeholder="Invoice #, Customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <div>
            <label htmlFor="statusFilter" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Status:
            </label>
            <select 
              id="statusFilter"
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ 
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="dateStart" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              From Date:
            </label>
            <input
              id="dateStart"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              style={{ 
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <div>
            <label htmlFor="dateEnd" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              To Date:
            </label>
            <input
              id="dateEnd"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              style={{ 
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
        
        {/* Clear Filters Button */}
        {(searchTerm || filterStatus !== 'all' || dateRange.start || dateRange.end) && (
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setDateRange({ start: '', end: '' });
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}
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