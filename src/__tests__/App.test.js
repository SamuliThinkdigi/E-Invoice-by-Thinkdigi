import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  test('renders the main application', () => {
    render(<App />);
    expect(screen.getByText('E-Invoice Management System')).toBeInTheDocument();
    expect(screen.getByText('Create New Invoice')).toBeInTheDocument();
    expect(screen.getByText('View All Invoices')).toBeInTheDocument();
  });

  test('shows invoice list by default', () => {
    render(<App />);
    expect(screen.getByText(/Invoice List/)).toBeInTheDocument();
  });

  test('switches to create invoice form when clicking create button', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const createButton = screen.getByText('Create New Invoice');
    await user.click(createButton);
    
    expect(screen.getByText('Create New Invoice')).toBeInTheDocument();
    expect(screen.getByLabelText('Invoice Number')).toBeInTheDocument();
  });

  test('loads invoices from localStorage on mount', () => {
    const mockInvoices = [
      {
        id: '1',
        invoiceNumber: 'INV-001',
        customerName: 'Test Customer',
        total: 100,
        status: 'draft'
      }
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockInvoices));
    
    render(<App />);
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('invoices');
  });

  test('saves invoices to localStorage when invoices change', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Click create invoice
    await user.click(screen.getByText('Create New Invoice'));
    
    // Fill out the form
    await user.type(screen.getByLabelText('Invoice Number'), 'INV-001');
    await user.type(screen.getByLabelText('Customer Name'), 'Test Customer');
    await user.type(screen.getByLabelText('Customer Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Due Date'), '2024-12-31');
    
    // Submit the form
    await user.click(screen.getByText('Create Invoice'));
    
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });
});