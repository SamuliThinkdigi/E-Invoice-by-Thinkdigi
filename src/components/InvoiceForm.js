import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const InvoiceForm = ({ invoice, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    invoiceNumber: invoice?.invoiceNumber || '',
    customerName: invoice?.customerName || '',
    customerEmail: invoice?.customerEmail || '',
    customerAddress: invoice?.customerAddress || '',
    issueDate: invoice?.issueDate || new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate || '',
    items: invoice?.items || [{ id: uuidv4(), description: '', quantity: 1, price: 0 }],
    notes: invoice?.notes || '',
    tax: invoice?.tax || 10 // Default tax percentage
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = formData.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: uuidv4(), description: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      // Fixed: Handle invalid numbers properly
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + (quantity * price);
    }, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    // Fixed: Handle floating point precision issues
    const taxRate = parseFloat(formData.tax) || 0;
    return Math.round((subtotal * taxRate) / 100 * 100) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    // Fixed: Round the total to avoid floating point precision issues
    return Math.round((subtotal + tax) * 100) / 100;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'Invoice number is required';
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else if (new Date(formData.dueDate) < new Date(formData.issueDate)) {
      newErrors.dueDate = 'Due date must be after issue date';
    }

    // Fixed: Properly validate items with better number handling
    formData.items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = 'Item description is required';
      }
      
      const quantity = parseFloat(item.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      
      const price = parseFloat(item.price);
      if (isNaN(price) || price < 0) {
        newErrors[`item_${index}_price`] = 'Price cannot be negative';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const invoiceData = {
        ...formData,
        subtotal: calculateSubtotal(),
        taxAmount: calculateTax(),
        total: calculateTotal()
      };
      onSubmit(invoiceData);
    }
  };

  return (
    <form className="invoice-form" onSubmit={handleSubmit}>
      <h2>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label htmlFor="invoiceNumber">Invoice Number</label>
          <input
            type="text"
            id="invoiceNumber"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={handleInputChange}
          />
          {errors.invoiceNumber && <div className="error">{errors.invoiceNumber}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="issueDate">Issue Date</label>
          <input
            type="date"
            id="issueDate"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="customerName">Customer Name</label>
        <input
          type="text"
          id="customerName"
          name="customerName"
          value={formData.customerName}
          onChange={handleInputChange}
        />
        {errors.customerName && <div className="error">{errors.customerName}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="customerEmail">Customer Email</label>
        <input
          type="email"
          id="customerEmail"
          name="customerEmail"
          value={formData.customerEmail}
          onChange={handleInputChange}
        />
        {errors.customerEmail && <div className="error">{errors.customerEmail}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="customerAddress">Customer Address</label>
        <textarea
          id="customerAddress"
          name="customerAddress"
          value={formData.customerAddress}
          onChange={handleInputChange}
          rows="3"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
          />
          {errors.dueDate && <div className="error">{errors.dueDate}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="tax">Tax (%)</label>
          <input
            type="number"
            id="tax"
            name="tax"
            value={formData.tax}
            onChange={handleInputChange}
            min="0"
            max="100"
            step="0.01"
          />
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Invoice Items</h3>
        {formData.items.map((item, index) => (
          <div key={item.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                />
                {errors[`item_${index}_description`] && 
                  <div className="error">{errors[`item_${index}_description`]}</div>}
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                  min="1"
                />
                {errors[`item_${index}_quantity`] && 
                  <div className="error">{errors[`item_${index}_quantity`]}</div>}
              </div>

              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
                {errors[`item_${index}_price`] && 
                  <div className="error">{errors[`item_${index}_price`]}</div>}
              </div>

              <button
                type="button"
                className="btn btn-danger"
                onClick={() => removeItem(index)}
                disabled={formData.items.length === 1}
              >
                Remove
              </button>
            </div>
            <div style={{ textAlign: 'right', marginTop: '0.5rem', fontWeight: 'bold' }}>
              Total: ${((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)).toFixed(2)}
            </div>
          </div>
        ))}

        <button type="button" className="btn btn-secondary" onClick={addItem}>
          Add Item
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows="3"
        />
      </div>

      <div className="invoice-summary">
        <div>Subtotal: ${calculateSubtotal().toFixed(2)}</div>
        <div>Tax ({formData.tax}%): ${calculateTax().toFixed(2)}</div>
        <div className="total">Total: ${calculateTotal().toFixed(2)}</div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button type="submit" className="btn btn-primary">
          {invoice ? 'Update Invoice' : 'Create Invoice'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;