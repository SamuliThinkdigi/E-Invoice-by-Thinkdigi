import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvoiceForm from '../components/InvoiceForm';

describe('InvoiceForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  test('renders create form by default', () => {
    render(<InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByText('Create New Invoice')).toBeInTheDocument();
    expect(screen.getByLabelText('Invoice Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Customer Name')).toBeInTheDocument();
  });

  test('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    render(<InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const submitButton = screen.getByText('Create Invoice');
    await user.click(submitButton);
    
    expect(screen.getByText('Invoice number is required')).toBeInTheDocument();
    expect(screen.getByText('Customer name is required')).toBeInTheDocument();
    expect(screen.getByText('Customer email is required')).toBeInTheDocument();
    expect(screen.getByText('Due date is required')).toBeInTheDocument();
  });

  test('validates email format', async () => {
    const user = userEvent.setup();
    render(<InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const emailInput = screen.getByLabelText('Customer Email');
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByText('Create Invoice');
    await user.click(submitButton);
    
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  test('validates due date is after issue date', async () => {
    const user = userEvent.setup();
    render(<InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const issueDate = screen.getByLabelText('Issue Date');
    const dueDate = screen.getByLabelText('Due Date');
    
    await user.clear(issueDate);
    await user.type(issueDate, '2024-01-15');
    await user.type(dueDate, '2024-01-10'); // Due date before issue date
    
    const submitButton = screen.getByText('Create Invoice');
    await user.click(submitButton);
    
    expect(screen.getByText('Due date must be after issue date')).toBeInTheDocument();
  });

  test('calculates item total correctly', async () => {
    const user = userEvent.setup();
    render(<InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    // Fill in item details
    const quantityInput = screen.getByDisplayValue('1');
    const priceInput = screen.getByDisplayValue('0');
    
    await user.clear(quantityInput);
    await user.type(quantityInput, '5');
    await user.clear(priceInput);
    await user.type(priceInput, '10.50');
    
    // The total should be displayed as 52.50
    await waitFor(() => {
      expect(screen.getByText('Total: $52.50')).toBeInTheDocument();
    });
  });

  test('handles floating point calculations correctly', async () => {
    const user = userEvent.setup();
    render(<InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    // Fill in item details that could cause floating point issues
    const quantityInput = screen.getByDisplayValue('1');
    const priceInput = screen.getByDisplayValue('0');
    
    await user.clear(quantityInput);
    await user.type(quantityInput, '3');
    await user.clear(priceInput);
    await user.type(priceInput, '0.1'); // This can cause floating point precision issues
    
    // Check if the calculation is correct - should be 0.30
    await waitFor(() => {
      expect(screen.getByText('Total: $0.30')).toBeInTheDocument();
      expect(screen.getByText('Subtotal: $0.30')).toBeInTheDocument();
      expect(screen.getByText('Tax (10%): $0.03')).toBeInTheDocument();
      expect(screen.getByText('Total: $0.33')).toBeInTheDocument();
    });
  });

  test('validates item fields correctly', async () => {
    const user = userEvent.setup();
    render(<InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    // Find the item inputs by their position in the form
    const quantityInput = screen.getByDisplayValue('1');
    
    // Set invalid values - just test quantity validation since HTML5 controls prevent negative prices in UI
    await user.clear(quantityInput);
    await user.type(quantityInput, '0'); // Invalid quantity
    
    const submitButton = screen.getByText('Create Invoice');
    await user.click(submitButton);
    
    expect(screen.getByText('Item description is required')).toBeInTheDocument();
    expect(screen.getByText('Quantity must be greater than 0')).toBeInTheDocument();
  });

  test('adds and removes items correctly', async () => {
    const user = userEvent.setup();
    render(<InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    // Initially should have 1 item
    expect(screen.getAllByText('Description')).toHaveLength(1);
    
    // Add item
    const addButton = screen.getByText('Add Item');
    await user.click(addButton);
    
    // Should now have 2 items
    expect(screen.getAllByText('Description')).toHaveLength(2);
    
    // Remove item
    const removeButtons = screen.getAllByText('Remove');
    await user.click(removeButtons[1]);
    
    // Should be back to 1 item
    expect(screen.getAllByText('Description')).toHaveLength(1);
  });

  test('handles invalid number inputs gracefully', async () => {
    const user = userEvent.setup();
    render(<InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const quantityInput = screen.getByDisplayValue('1');
    const priceInput = screen.getByDisplayValue('0');
    
    // Try to input invalid values
    await user.clear(quantityInput);
    await user.type(quantityInput, 'abc'); // Non-numeric input
    await user.clear(priceInput);
    await user.type(priceInput, 'xyz'); // Non-numeric input
    
    // The form should handle this gracefully
    const submitButton = screen.getByText('Create Invoice');
    await user.click(submitButton);
    
    // Should show validation errors
    expect(screen.getByText('Quantity must be greater than 0')).toBeInTheDocument();
  });

  test('calculates tax correctly', async () => {
    const user = userEvent.setup();
    render(<InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    // Set up an item
    const quantityInput = screen.getByDisplayValue('1');
    const priceInput = screen.getByDisplayValue('0');
    
    await user.clear(quantityInput);
    await user.type(quantityInput, '1');
    await user.clear(priceInput);
    await user.type(priceInput, '100');
    
    // Tax should be calculated (default 10%)
    await waitFor(() => {
      expect(screen.getByText('Tax (10%): $10.00')).toBeInTheDocument();
      expect(screen.getByText('Total: $110.00')).toBeInTheDocument();
    });
  });
});