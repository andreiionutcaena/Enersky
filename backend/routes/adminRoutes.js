const express = require('express');
const router = express.Router();
const { getDistribuitoriInAsteptare, aprobaDistribuitor } = require('../controllers/adminController');

// 1. Preluare lista distribuitori in asteptare
router.get('/in-asteptare', getDistribuitoriInAsteptare);

// 2. Aprobare cont distribuitor
router.put('/aproba/:id', aprobaDistribuitor);

module.exports = router;