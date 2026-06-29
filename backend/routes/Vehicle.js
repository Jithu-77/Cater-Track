const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Notification = require('../models/Notification');

// GET: Get all vehicles with AI insights
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('bookingHistory.bookedBy', 'name email');

    // Calculate AI insights for each vehicle
    const vehiclesWithInsights = vehicles.map(vehicle => {
      if (vehicle.calculateUtilization) {
        vehicle.calculateUtilization();
      }
      if (vehicle.calculateFuelEfficiency) {
        vehicle.calculateFuelEfficiency();
      }
      if (vehicle.predictMaintenanceNeeds) {
        vehicle.predictMaintenanceNeeds();
      }
      return vehicle;
    });

    res.json(vehiclesWithInsights);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching vehicles', error: err.message });
  }
});

// POST: Add new vehicle
router.post('/', async (req, res) => {
  try {
    const newVehicle = new Vehicle(req.body);
    await newVehicle.save();
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(400).json({ message: 'Error adding vehicle', error: err.message });
  }
});

// PUT: Update vehicle
router.put('/:id', async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(updatedVehicle);
  } catch (err) {
    res.status(400).json({ message: 'Error updating vehicle', error: err.message });
  }
});

// DELETE: Remove vehicle
router.delete('/:id', async (req, res) => {
  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!deletedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle deleted successfully', deletedVehicle });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting vehicle', error: err.message });
  }
});

// POST: Book vehicle
router.post('/:id/book', async (req, res) => {
  try {
    const { bookedBy, startDate, endDate, purpose, route } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.status !== 'available') {
      return res.status(400).json({ message: 'Vehicle is not available for booking' });
    }

    // Add booking
    vehicle.bookingHistory.push({
      bookedBy,
      startDate,
      endDate,
      purpose,
      route,
      status: 'confirmed'
    });

    vehicle.status = 'booked';
    await vehicle.save();

    res.json({ message: 'Vehicle booked successfully', vehicle });
  } catch (err) {
    res.status(400).json({ message: 'Error booking vehicle', error: err.message });
  }
});

module.exports = router;
