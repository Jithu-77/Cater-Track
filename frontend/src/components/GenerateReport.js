import { useState } from 'react';
import './GenerateReport.css';

function GenerateReport({ isOpen, onClose, onGenerate }) {
  const [reportConfig, setReportConfig] = useState({
    type: 'sales',
    period: 'monthly',
    startDate: '',
    endDate: '',
    format: 'pdf',
    includeCharts: true,
    includeDetails: true,
    emailReport: false,
    emailAddress: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { value: 'sales', label: 'Sales Report', icon: '💰' },
    { value: 'inventory', label: 'Inventory Report', icon: '📦' },
    { value: 'staff', label: 'Staff Performance', icon: '👥' },
    { value: 'customer', label: 'Customer Analytics', icon: '👤' },
    { value: 'financial', label: 'Financial Summary', icon: '📊' },
    { value: 'events', label: 'Events Report', icon: '📅' }
  ];

  const periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV File' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReportConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getDateRange = () => {
    const today = new Date();
    const startDate = new Date();
    
    switch (reportConfig.period) {
      case 'daily':
        return {
          start: today.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'weekly':
        startDate.setDate(today.getDate() - 7);
        return {
          start: startDate.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'monthly':
        startDate.setMonth(today.getMonth() - 1);
        return {
          start: startDate.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'quarterly':
        startDate.setMonth(today.getMonth() - 3);
        return {
          start: startDate.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'yearly':
        startDate.setFullYear(today.getFullYear() - 1);
        return {
          start: startDate.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      default:
        return {
          start: reportConfig.startDate,
          end: reportConfig.endDate
        };
    }
  };

  const generateSampleData = () => {
    const { start, end } = getDateRange();
    
    const sampleData = {
      sales: {
        totalRevenue: 2500000,
        totalOrders: 45,
        averageOrderValue: 55555,
        topItems: ['Butter Chicken', 'Biryani', 'Paneer Tikka'],
        growth: 15.3
      },
      inventory: {
        totalItems: 120,
        lowStockItems: 8,
        expiringSoon: 3,
        totalValue: 450000,
        topCategories: ['Vegetables', 'Dairy', 'Spices']
      },
      staff: {
        totalStaff: 38,
        averageRating: 4.6,
        topPerformers: ['Ravi Kumar', 'Priya Singh', 'Amit Sharma'],
        totalHours: 1520
      },
      customer: {
        totalCustomers: 156,
        newCustomers: 23,
        repeatCustomers: 89,
        averageRating: 4.8,
        loyaltyPoints: 45600
      },
      financial: {
        revenue: 2500000,
        expenses: 1800000,
        profit: 700000,
        profitMargin: 28,
        taxes: 140000
      },
      events: {
        totalEvents: 45,
        completedEvents: 42,
        upcomingEvents: 8,
        cancelledEvents: 3,
        averageGuests: 67
      }
    };

    return {
      type: reportConfig.type,
      period: reportConfig.period,
      dateRange: { start, end },
      data: sampleData[reportConfig.type],
      generatedAt: new Date().toISOString(),
      format: reportConfig.format
    };
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      const reportData = generateSampleData();
      onGenerate(reportData);
      setIsGenerating(false);
      
      if (reportConfig.emailReport && reportConfig.emailAddress) {
        alert(`Report will be sent to ${reportConfig.emailAddress}`);
      }
      
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal generate-report-modal">
        <div className="modal-header">
          <h2>📊 Generate Report</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="report-form">
          <div className="form-section">
            <h3>Report Type</h3>
            <div className="report-types-grid">
              {reportTypes.map(type => (
                <label key={type.value} className={`report-type-card ${reportConfig.type === type.value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={reportConfig.type === type.value}
                    onChange={handleInputChange}
                  />
                  <div className="card-content">
                    <span className="card-icon">{type.icon}</span>
                    <span className="card-label">{type.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Time Period</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Period</label>
                <select
                  name="period"
                  value={reportConfig.period}
                  onChange={handleInputChange}
                >
                  {periods.map(period => (
                    <option key={period.value} value={period.value}>{period.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Format</label>
                <select
                  name="format"
                  value={reportConfig.format}
                  onChange={handleInputChange}
                >
                  {formats.map(format => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {reportConfig.period === 'custom' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={reportConfig.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={reportConfig.endDate}
                    onChange={handleInputChange}
                    min={reportConfig.startDate}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Report Options</h3>
            <div className="options-grid">
              <label className="option-checkbox">
                <input
                  type="checkbox"
                  name="includeCharts"
                  checked={reportConfig.includeCharts}
                  onChange={handleInputChange}
                />
                <span>Include Charts & Graphs</span>
              </label>
              <label className="option-checkbox">
                <input
                  type="checkbox"
                  name="includeDetails"
                  checked={reportConfig.includeDetails}
                  onChange={handleInputChange}
                />
                <span>Include Detailed Breakdown</span>
              </label>
              <label className="option-checkbox">
                <input
                  type="checkbox"
                  name="emailReport"
                  checked={reportConfig.emailReport}
                  onChange={handleInputChange}
                />
                <span>Email Report</span>
              </label>
            </div>

            {reportConfig.emailReport && (
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="emailAddress"
                  value={reportConfig.emailAddress}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>
            )}
          </div>

          <div className="report-preview">
            <h3>Report Preview</h3>
            <div className="preview-info">
              <div className="preview-item">
                <span className="preview-label">Type:</span>
                <span className="preview-value">
                  {reportTypes.find(t => t.value === reportConfig.type)?.label}
                </span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Period:</span>
                <span className="preview-value">
                  {periods.find(p => p.value === reportConfig.period)?.label}
                </span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Format:</span>
                <span className="preview-value">
                  {formats.find(f => f.value === reportConfig.format)?.label}
                </span>
              </div>
              {reportConfig.period === 'custom' && reportConfig.startDate && reportConfig.endDate && (
                <div className="preview-item">
                  <span className="preview-label">Date Range:</span>
                  <span className="preview-value">
                    {reportConfig.startDate} to {reportConfig.endDate}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button 
              className="btn-primary" 
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="spinner">⏳</span>
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </button>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerateReport;
