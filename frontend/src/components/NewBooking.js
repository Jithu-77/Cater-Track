import { useState } from 'react';
import './NewBooking.css';

function NewBooking({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    eventType: 'wedding',
    eventDate: '',
    eventTime: '',
    guests: '',
    location: '',
    budget: '',
    menuType: 'vegetarian',
    specialRequests: '',
    decorations: false,
    photography: false,
    musicSystem: false
  });

  const [errors, setErrors] = useState({});

  const eventTypes = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'corporate', label: 'Corporate Event' },
    { value: 'birthday', label: 'Birthday Party' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'conference', label: 'Conference' },
    { value: 'private', label: 'Private Party' }
  ];

  const menuTypes = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'non-vegetarian', label: 'Non-Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'mixed', label: 'Mixed (Veg + Non-Veg)' },
    { value: 'custom', label: 'Custom Menu' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
    if (!formData.clientEmail.trim()) newErrors.clientEmail = 'Email is required';
    if (!formData.clientPhone.trim()) newErrors.clientPhone = 'Phone is required';
    if (!formData.eventDate) newErrors.eventDate = 'Event date is required';
    if (!formData.eventTime) newErrors.eventTime = 'Event time is required';
    if (!formData.guests || formData.guests < 1) newErrors.guests = 'Number of guests is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.budget || formData.budget < 1000) newErrors.budget = 'Budget must be at least ₹1,000';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const bookingData = {
        ...formData,
        id: `BK-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        estimatedAmount: calculateEstimatedAmount()
      };
      onSubmit(bookingData);
      onClose();
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        eventType: 'wedding',
        eventDate: '',
        eventTime: '',
        guests: '',
        location: '',
        budget: '',
        menuType: 'vegetarian',
        specialRequests: '',
        decorations: false,
        photography: false,
        musicSystem: false
      });
    }
  };

  const calculateEstimatedAmount = () => {
    const basePrice = {
      wedding: 1500,
      corporate: 800,
      birthday: 600,
      anniversary: 1000,
      conference: 500,
      private: 700
    };
    
    const menuMultiplier = {
      vegetarian: 1,
      'non-vegetarian': 1.3,
      vegan: 1.1,
      mixed: 1.2,
      custom: 1.4
    };

    let amount = basePrice[formData.eventType] * parseInt(formData.guests || 0);
    amount *= menuMultiplier[formData.menuType];
    
    if (formData.decorations) amount += 15000;
    if (formData.photography) amount += 25000;
    if (formData.musicSystem) amount += 10000;

    return Math.round(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal new-booking-modal">
        <div className="modal-header">
          <h2>📅 New Booking</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-section">
            <h3>Client Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Client Name *</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  className={errors.clientName ? 'error' : ''}
                />
                {errors.clientName && <span className="error-text">{errors.clientName}</span>}
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  className={errors.clientEmail ? 'error' : ''}
                />
                {errors.clientEmail && <span className="error-text">{errors.clientEmail}</span>}
              </div>
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleInputChange}
                placeholder="+91-9876543210"
                className={errors.clientPhone ? 'error' : ''}
              />
              {errors.clientPhone && <span className="error-text">{errors.clientPhone}</span>}
            </div>
          </div>

          <div className="form-section">
            <h3>Event Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Event Type *</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Menu Type *</label>
                <select
                  name="menuType"
                  value={formData.menuType}
                  onChange={handleInputChange}
                >
                  {menuTypes.map(menu => (
                    <option key={menu.value} value={menu.value}>{menu.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Event Date *</label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.eventDate ? 'error' : ''}
                />
                {errors.eventDate && <span className="error-text">{errors.eventDate}</span>}
              </div>
              <div className="form-group">
                <label>Event Time *</label>
                <input
                  type="time"
                  name="eventTime"
                  value={formData.eventTime}
                  onChange={handleInputChange}
                  className={errors.eventTime ? 'error' : ''}
                />
                {errors.eventTime && <span className="error-text">{errors.eventTime}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Number of Guests *</label>
                <input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleInputChange}
                  min="1"
                  className={errors.guests ? 'error' : ''}
                />
                {errors.guests && <span className="error-text">{errors.guests}</span>}
              </div>
              <div className="form-group">
                <label>Budget (₹) *</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  min="1000"
                  className={errors.budget ? 'error' : ''}
                />
                {errors.budget && <span className="error-text">{errors.budget}</span>}
              </div>
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Event venue address"
                className={errors.location ? 'error' : ''}
              />
              {errors.location && <span className="error-text">{errors.location}</span>}
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Services</h3>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="decorations"
                  checked={formData.decorations}
                  onChange={handleInputChange}
                />
                <span>Decorations (+₹15,000)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="photography"
                  checked={formData.photography}
                  onChange={handleInputChange}
                />
                <span>Photography (+₹25,000)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="musicSystem"
                  checked={formData.musicSystem}
                  onChange={handleInputChange}
                />
                <span>Music System (+₹10,000)</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label>Special Requests</label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any special dietary requirements, preferences, or requests..."
              />
            </div>
          </div>

          <div className="estimated-amount">
            <h3>Estimated Amount: ₹{calculateEstimatedAmount().toLocaleString('en-IN')}</h3>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary">Create Booking</button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewBooking;
