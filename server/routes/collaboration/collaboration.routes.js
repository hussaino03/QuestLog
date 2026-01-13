const express = require('express');
const router = express.Router();
const {
  shareProject,
  getSharedProject,
  updateSharedProject,
  updateSharedProjectDetails
} = require('../../controllers/collaboration/collaboration.controller');

router.post('/projects/:taskId/share', shareProject);
router.get('/projects/:taskId', getSharedProject);
router.put('/projects/:taskId/update', updateSharedProject);
router.put('/projects/:taskId/details', updateSharedProjectDetails);

module.exports = router;
