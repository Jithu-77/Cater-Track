import { useState } from 'react';
import './AddStaff.css';

function AddStaff({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'chef',
    department: 'kitchen',
    salary: '',
    experience: '',
    joiningDate: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    skills: [],
    shift: 'morning',
    employmentType: 'full-time'
  });

  const [errors, setErrors] = useState({});

  const roles = [
    { value: 'chef', label: 'Chef' },
    { value: 'sous-chef', label: 'Sous Chef' },
    { value: 'cook', label: 'Cook' },
    { value: 'waiter', label: 'Waiter' },
    { value: 'manager', label: 'Manager' },
    { value: 'driver', label: 'Delivery Driver' },
    { value: 'cleaner', label: 'Cleaner' },
    { value: 'helper', label: 'Kitchen Helper' }
  ];

  const departments = [
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'service', label: 'Service' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'management', label: 'Management' },
    { value: 'cleaning', label: 'Cleaning' }
  ];

  const skillOptions = [
    'Indian Cuisine', 'Chinese Cuisine', 'Continental', 'Baking', 'Grilling',
    'Food Safety', 'Customer Service', 'Team Leadership', 'Inventory Management',
    'Event Planning', 'Decoration', 'Photography'
  ];

  const shifts = [
    { value: 'morning', label: 'Morning (6 AM - 2 PM)' },
    { value: 'afternoon', label: 'Afternoon (2 PM - 10 PM)' },
    { value: 'night', label: 'Night (10 PM - 6 AM)' },
    { value: 'flexible', label: 'Flexible' }
  ];

  const employmentTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'temporary', label: 'Temporary' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillChange = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.salary || formData.salary < 15000) newErrors.salary = 'Salary must be at least ₹15,000';
    if (!formData.experience || formData.experience < 0) newErrors.experience = 'Experience is required';
    if (!formData.joiningDate) newErrors.joiningDate = 'Joining date is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required';
    if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const staffData = {
        ...formData,
        id: `EMP-${Date.now()}`,
        status: 'active',
        createdAt: new Date().toISOString(),
        employeeId: `EMP${String(Date.now()).slice(-6)}`
      };
      onSubmit(staffData);
      onClose();
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'chef',
        department: 'kitchen',
        salary: '',
        experience: '',
        joiningDate: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        skills: [],
        shift: 'morning',
        employmentType: 'full-time'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal add-staff-modal">
        <div className="modal-header">
          <h2>👨‍🍳 Add New Staff Member</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="staff-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
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
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91-9876543210"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Joining Date *</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  className={errors.joiningDate ? 'error' : ''}
                />
                {errors.joiningDate && <span className="error-text">{errors.joiningDate}</span>}
              </div>
            </div>
            <div className="form-group">
              <label>Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="2"
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>
          </div>

          <div className="form-section">
            <h3>Job Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                >
                  {departments.map(dept => (
                    <option key={dept.value} value={dept.value}>{dept.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Monthly Salary (₹) *</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  min="15000"
                  className={errors.salary ? 'error' : ''}
                />
                {errors.salary && <span className="error-text">{errors.salary}</span>}
              </div>
              <div className="form-group">
                <label>Experience (Years) *</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                  className={errors.experience ? 'error' : ''}
                />
                {errors.experience && <span className="error-text">{errors.experience}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Shift *</label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleInputChange}
                >
                  {shifts.map(shift => (
                    <option key={shift.value} value={shift.value}>{shift.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Employment Type *</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                >
                  {employmentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Skills & Expertise</h3>
            <div className="skills-grid">
              {skillOptions.map(skill => (
                <label key={skill} className="skill-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => handleSkillChange(skill)}
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Emergency Contact</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Emergency Contact Name *</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  className={errors.emergencyContact ? 'error' : ''}
                />
                {errors.emergencyContact && <span className="error-text">{errors.emergencyContact}</span>}
              </div>
              <div className="form-group">
                <label>Emergency Phone *</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  className={errors.emergencyPhone ? 'error' : ''}
                />
                {errors.emergencyPhone && <span className="error-text">{errors.emergencyPhone}</span>}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary">Add Staff Member</button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStaff;
