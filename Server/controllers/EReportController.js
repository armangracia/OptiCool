const Report = require('../models/EReport');  
const User = require('../models/User');     
const moment = require('moment-timezone');    

exports.sendReport = async (req, res, next) => {
  try {
    console.log("Request Body:", req.body); 

    const { appliance, status, user, description } = req.body;

    
    if (!appliance || !status || !user || !description) {
      console.log("Missing required fields:", { appliance, status, user, description });
      return res.status(400).json({ message: 'Appliance, status, description, and user are required.' });
    }

    
    const userData = await User.findById(user);
    if (!userData) {
      return res.status(404).json({ message: 'User not found.' });
    }

    
    const timeReported = moment().tz("Asia/Manila").format("hh:mm:ss A");
    console.log("Time Reported:", timeReported);

    
    const newReport = await Report.create({
      appliance,
      status,
      description,
      reportDate: new Date(),
      timeReported,
      user,
    });

    console.log("New Report Created:", newReport);

    return res.status(201).json({
      message: 'Report successfully submitted',
      success: true,
      report: newReport,
    });

  } catch (err) {
    console.error("Error submitting report:", err);
    return res.status(400).json({
      message: err.message || 'Something went wrong while submitting the report. Please try again later.',
      success: false,
    });
  }
};


exports.getAllReports = async (req, res, next) => {
    try {
        const reports = await Report.find().populate('user', 'username email');  

        if (!reports || reports.length === 0) {
            return res.status(404).json({ message: 'No reports found.' });
        }

        console.log("Fetched Reports:", reports); 
        return res.status(200).json({ reports });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Something went wrong while fetching the reports. Please try again later.',
            success: false,
        });
    }
};

exports.getNumberOfReports = async (req, res) => {
    try {
        const reportCount = await Report.countDocuments();
        return res.json({
            success: true,
            count: reportCount,
        });
    } catch (err) {
        return res.status(400).json({
            message: 'Please try again later',
            success: false,
        });
    }
};


exports.resolveReport = async (req, res) => {
    try {
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { isResolved: "yes" },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ message: 'Report not found.' });
        }

        return res.status(200).json({ success: true, report });
    } catch (err) {
        console.error("Error resolving report:", err.message);
        return res.status(500).json({ message: 'Server error while resolving report.' });
    }
};


exports.restoreReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    const updated = await Report.findByIdAndUpdate(
      reportId,
      { isResolved: "no" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.status(200).json({ success: true, message: "Report status restored", report: updated });
  } catch (err) {
    console.error("Restore error:", err.message);
    return res.status(500).json({ success: false, message: "Server error restoring status" });
  }
};