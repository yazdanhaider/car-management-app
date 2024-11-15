const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
  // Serve the Postman collection JSON file
  res.sendFile(path.join(__dirname, '../docs/postman-collection.json'));
});

module.exports = router; 