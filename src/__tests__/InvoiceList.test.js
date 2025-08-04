import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvoiceList from '../components/InvoiceList';

describe('InvoiceList Component', () => {
  const mockOnSelect = jest.fn();
  const mockOnDelete = jest.fn();
  
  const sampleInvoices = [
    {
      id: '1',
      invoiceNumber: 'INV-001',
      customerName: 'John Doe',
      createdAt: '2024-01-01T00:00:00Z',
      dueDate: '2024-01-31T00:00:00Z',
      total: 100.50,
      status: 'draft'
    },
    {
      id: '2',
      invoiceNumber: 'INV-002',
      customerName: 'Jane Smith',
      createdAt: '2024-01-02T00:00:00Z',
      dueDate: '2024-02-01T00:00:00Z',
      total: 250.75,
      status: 'sent'
    },
    {
      id: '3',
      invoiceNumber: 'INV-003',
      customerName: 'Bob Johnson',
      createdAt: '2024-01-03T00:00:00Z',
      dueDate: '2024-02-02T00:00:00Z',
      total: 75.25,
      status: 'paid'
    }
  ];

  beforeEach(() => {
    mockOnSelect.mockClear();
    mockOnDelete.mockClear();
  });

  test('renders invoice list with correct count', () => {
    render(<InvoiceList invoices={sampleInvoices} onSelect={mockOnSelect} onDelete={mockOnDelete} />);
    expect(screen.getByText('Invoice List (3)')).toBeInTheDocument();
  });

  test('displays all invoice information correctly', () => {
    render(<InvoiceList invoices={sampleInvoices} onSelect={mockOnSelect} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('$100.50')).toBeInTheDocument();
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
  });

  test('filters invoices by status', async () => {
    const user = userEvent.setup();
    render(<InvoiceList invoices={sampleInvoices} onSelect={mockOnSelect} onDelete={mockOnDelete} />);
    
    const statusFilter = screen.getByLabelText('Filter by Status:');
    await user.selectOptions(statusFilter, 'paid');
    
    // Should only show paid invoice
    expect(screen.getByText('Invoice List (1)')).toBeInTheDocument();
    expect(screen.getByText('INV-003')).toBeInTheDocument();
    expect(screen.queryByText('INV-001')).not.toBeInTheDocument();
  });

  test('sorts invoices by clicking column headers', async () => {
    const user = userEvent.setup();
    render(<InvoiceList invoices={sampleInvoices} onSelect={mockOnSelect} onDelete={mockOnDelete} />);
    
    // Click on Customer column to sort
    const customerHeader = screen.getByText(/Customer/);
    await user.click(customerHeader);
    
    // Verify sorting indicator appears
    expect(screen.getByText(/Customer ↑/)).toBeInTheDocument();
  });

  test('calls onSelect when invoice row is clicked', async () => {
    const user = userEvent.setup();
    render(<InvoiceList invoices={sampleInvoices} onSelect={mockOnSelect} onDelete={mockOnDelete} />);
    
    const invoiceRow = screen.getByText('INV-001').closest('tr');
    await user.click(invoiceRow);
    
    expect(mockOnSelect).toHaveBeenCalledWith(sampleInvoices[0]);
  });

  test('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
    
    render(<InvoiceList invoices={sampleInvoices} onSelect={mockOnSelect} onDelete={mockOnDelete} />);
    
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this invoice?');
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  test('does not delete when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    // Mock window.confirm to return false
    window.confirm = jest.fn(() => false);
    
    render(<InvoiceList invoices={sampleInvoices} onSelect={mockOnSelect} onDelete={mockOnDelete} />);
    
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  test('shows empty state when no invoices', () => {
    render(<InvoiceList invoices={[]} onSelect={mockOnSelect} onDelete={mockOnDelete} />);
    expect(screen.getByText('No invoices created yet.')).toBeInTheDocument();
  });

  test('shows filtered empty state', async () => {
    const user = userEvent.setup();
    render(<InvoiceList invoices={sampleInvoices} onSelect={mockOnSelect} onDelete={mockOnDelete} />);
    
    const statusFilter = screen.getByLabelText('Filter by Status:');
    await user.selectOptions(statusFilter, 'overdue');
    
    expect(screen.getByText('No invoices match the current filter.')).toBeInTheDocument();
  });

  test('handles invalid date formatting gracefully', () => {
    const invoiceWithInvalidDate = [{
      id: '1',
      invoiceNumber: 'INV-001',
      customerName: 'John Doe',
      createdAt: 'invalid-date',
      dueDate: 'also-invalid',
      total: 100.50,
      status: 'draft'
    }];
    
    render(<InvoiceList invoices={invoiceWithInvalidDate} onSelect={mockOnSelect} onDelete={mockOnDelete} />);
    
    // Should still render the invoice, with proper error handling for invalid dates
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getAllByText('Invalid Date')).toHaveLength(2); // Both created and due dates
  });

  test('sorts by total amount correctly', async () => {
    const user = userEvent.setup();
    render(<InvoiceList invoices={sampleInvoices} onSelect={mockOnSelect} onDelete={mockOnDelete} />);
    
    // Click on Total column to sort
    const totalHeader = screen.getByText(/Total/);
    await user.click(totalHeader);
    
    // Verify sorting indicator appears
    expect(screen.getByText(/Total ↑/)).toBeInTheDocument();
  });
});