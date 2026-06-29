import { useState } from 'react';
import './UpdateInventory.css';

function UpdateInventory({ isOpen, onClose, onSubmit }) {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    name: '',
    category: 'vegetables',
    quantity: '',
    unit: 'kg',
    costPerUnit: '',
    supplier: '',
    expiryDate: '',
    minStockLevel: '',
    description: ''
  });

  const [updateData, setUpdateData] = useState({
    itemId: '',
    action: 'add',
    quantity: '',
    reason: ''
  });

  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'grains', label: 'Grains & Cereals' },
    { value: 'dairy', label: 'Dairy Products' },
    { value: 'meat', label: 'Meat & Poultry' },
    { value: 'spices', label: 'Spices & Herbs' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'oils', label: 'Oils & Fats' },
    { value: 'frozen', label: 'Frozen Items' },
    { value: 'others', label: 'Others' }
  ];

  const units = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'l', label: 'Liters (l)' },
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'pieces', label: 'Pieces' },
    { value: 'packets', label: 'Packets' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'bottles', label: 'Bottles' }
  ];

  const existingItems = [
    { id: 1, name: 'Basmati Rice', currentStock: 25, unit: 'kg' },
    { id: 2, name: 'Chicken', currentStock: 8, unit: 'kg' },
    { id: 3, name: 'Paneer', currentStock: 15, unit: 'kg' },
    { id: 4, name: 'Tomatoes', currentStock: 5, unit: 'kg' },
    { id: 5, name: 'Onions', currentStock: 20, unit: 'kg' },
    { id: 6, name: 'Cooking Oil', currentStock: 12, unit: 'l' },
    { id: 7, name: 'Milk', currentStock: 30, unit: 'l' },
    { id: 8, name: 'Potatoes', currentStock: 18, unit: 'kg' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateAddForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Item name is required';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (!formData.costPerUnit || formData.costPerUnit <= 0) newErrors.costPerUnit = 'Cost per unit is required';
    if (!formData.supplier.trim()) newErrors.supplier = 'Supplier name is required';
    if (!formData.minStockLevel || formData.minStockLevel < 0) newErrors.minStockLevel = 'Minimum stock level is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUpdateForm = () => {
    const newErrors = {};
    
    if (!updateData.itemId) newErrors.itemId = 'Please select an item';
    if (!updateData.quantity || updateData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (!updateData.reason.trim()) newErrors.reason = 'Reason is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (validateAddForm()) {
      const itemData = {
        ...formData,
        id: `INV-${Date.now()}`,
        status: 'active',
        createdAt: new Date().toISOString(),
        totalValue: formData.quantity * formData.costPerUnit
      };
      onSubmit({ type: 'add', data: itemData });
      onClose();
      resetForms();
    }
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (validateUpdateForm()) {
      const selectedItem = existingItems.find(item => item.id === parseInt(updateData.itemId));
      const updateInfo = {
        ...updateData,
        itemName: selectedItem?.name,
        timestamp: new Date().toISOString()
      };
      onSubmit({ type: 'update', data: updateInfo });
      onClose();
      resetForms();
    }
  };

  const resetForms = () => {
    setFormData({
      name: '',
      category: 'vegetables',
      quantity: '',
      unit: 'kg',
      costPerUnit: '',
      supplier: '',
      expiryDate: '',
      minStockLevel: '',
      description: ''
    });
    setUpdateData({
      itemId: '',
      action: 'add',
      quantity: '',
      reason: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal update-inventory-modal">
        <div className="modal-header">
          <h2>📦 Update Inventory</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="inventory-tabs">
          <button 
            className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            Add New Item
          </button>
          <button 
            className={`tab-btn ${activeTab === 'update' ? 'active' : ''}`}
            onClick={() => setActiveTab('update')}
          >
            Update Existing
          </button>
        </div>

        {activeTab === 'add' && (
          <form onSubmit={handleAddSubmit} className="inventory-form">
            <div className="form-section">
              <h3>Item Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Item Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className={errors.quantity ? 'error' : ''}
                  />
                  {errors.quantity && <span className="error-text">{errors.quantity}</span>}
                </div>
                <div className="form-group">
                  <label>Unit *</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                  >
                    {units.map(unit => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Cost per Unit (₹) *</label>
                  <input
                    type="number"
                    name="costPerUnit"
                    value={formData.costPerUnit}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={errors.costPerUnit ? 'error' : ''}
                  />
                  {errors.costPerUnit && <span className="error-text">{errors.costPerUnit}</span>}
                </div>
                <div className="form-group">
                  <label>Minimum Stock Level *</label>
                  <input
                    type="number"
                    name="minStockLevel"
                    value={formData.minStockLevel}
                    onChange={handleInputChange}
                    min="0"
                    className={errors.minStockLevel ? 'error' : ''}
                  />
                  {errors.minStockLevel && <span className="error-text">{errors.minStockLevel}</span>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Supplier *</label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    className={errors.supplier ? 'error' : ''}
                  />
                  {errors.supplier && <span className="error-text">{errors.supplier}</span>}
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Additional notes about the item..."
                />
              </div>
            </div>

            {formData.quantity && formData.costPerUnit && (
              <div className="total-value">
                <h3>Total Value: ₹{(formData.quantity * formData.costPerUnit).toLocaleString('en-IN')}</h3>
              </div>
            )}

            <div className="modal-actions">
              <button type="submit" className="btn-primary">Add Item</button>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </form>
        )}

        {activeTab === 'update' && (
          <form onSubmit={handleUpdateSubmit} className="inventory-form">
            <div className="form-section">
              <h3>Update Stock</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Select Item *</label>
                  <select
                    name="itemId"
                    value={updateData.itemId}
                    onChange={handleUpdateChange}
                    className={errors.itemId ? 'error' : ''}
                  >
                    <option value="">Choose an item...</option>
                    {existingItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} (Current: {item.currentStock} {item.unit})
                      </option>
                    ))}
                  </select>
                  {errors.itemId && <span className="error-text">{errors.itemId}</span>}
                </div>
                <div className="form-group">
                  <label>Action *</label>
                  <select
                    name="action"
                    value={updateData.action}
                    onChange={handleUpdateChange}
                  >
                    <option value="add">Add Stock</option>
                    <option value="remove">Remove Stock</option>
                    <option value="adjust">Adjust Stock</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={updateData.quantity}
                    onChange={handleUpdateChange}
                    min="0"
                    step="0.1"
                    className={errors.quantity ? 'error' : ''}
                  />
                  {errors.quantity && <span className="error-text">{errors.quantity}</span>}
                </div>
                <div className="form-group">
                  <label>Reason *</label>
                  <input
                    type="text"
                    name="reason"
                    value={updateData.reason}
                    onChange={handleUpdateChange}
                    placeholder="e.g., New purchase, Used for event, Damaged"
                    className={errors.reason ? 'error' : ''}
                  />
                  {errors.reason && <span className="error-text">{errors.reason}</span>}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button type="submit" className="btn-primary">Update Stock</button>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default UpdateInventory;
