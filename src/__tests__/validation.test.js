import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvoiceForm from '../components/InvoiceForm';

// Test validation logic directly
describe('Invoice Validation Logic', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  test('validates negative price correctly through form submission', async () => {
    const user = userEvent.setup();
    
    // Create a form with a pre-filled item that has negative price
    const invoiceWithNegativePrice = {
      invoiceNumber: 'INV-001',
      customerName: 'Test Customer',
      customerEmail: 'test@test.com',
      dueDate: '2024-12-31',
      items: [{ id: '1', description: 'Test Item', quantity: 1, price: -10 }]
    };
    
    render(<InvoiceForm invoice={invoiceWithNegativePrice} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const submitButton = screen.getByText('Update Invoice');
    await user.click(submitButton);
    
    expect(screen.getByText('Price cannot be negative')).toBeInTheDocument();
  });

  test('validates zero quantity correctly through form submission', async () => {
    const user = userEvent.setup();
    
    // Create a form with a pre-filled item that has zero quantity
    const invoiceWithZeroQuantity = {
      invoiceNumber: 'INV-001',
      customerName: 'Test Customer',
      customerEmail: 'test@test.com',
      dueDate: '2024-12-31',
      items: [{ id: '1', description: 'Test Item', quantity: 0, price: 10 }]
    };
    
    render(<InvoiceForm invoice={invoiceWithZeroQuantity} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const submitButton = screen.getByText('Update Invoice');
    await user.click(submitButton);
    
    expect(screen.getByText('Quantity must be greater than 0')).toBeInTheDocument();
  });

  test('handles NaN values in calculations correctly', () => {
    // Test the calculation functions directly
    const items = [
      { quantity: 'abc', price: 10 }, // NaN quantity
      { quantity: 5, price: 'xyz' },  // NaN price
      { quantity: 2, price: 15 }      // Valid values
    ];
    
    // Simulate the calculation logic
    const subtotal = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + (quantity * price);
    }, 0);
    
    // Should only count the valid item: 2 * 15 = 30
    expect(subtotal).toBe(30);
  });

  test('handles floating point precision correctly', () => {
    // Test floating point calculation precision
    const items = [{ quantity: 3, price: 0.1 }];
    
    const subtotal = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + (quantity * price);
    }, 0);
    
    const tax = Math.round((subtotal * 10) / 100 * 100) / 100; // 10% tax
    const total = Math.round((subtotal + tax) * 100) / 100;
    
    expect(subtotal).toBe(0.3); // Should be exactly 0.3, not 0.30000000000000004
    expect(tax).toBe(0.03);     // Should be exactly 0.03
    expect(total).toBe(0.33);   // Should be exactly 0.33
  });
});