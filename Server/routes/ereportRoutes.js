const express = require('express');
const router = express.Router();
const { sendReport, getAllReports, getNumberOfReports, resolveReport, restoreReport} = require('../controllers/EReportController');  // Import the controller

router.post('/ereport', sendReport);  
router.get('/getreport', getAllReports);  
router.get('/reportcount', getNumberOfReports);  
router.put('/:id/resolve', resolveReport); 
router.put('/:id/restore', restoreReport);

module.exports = router;