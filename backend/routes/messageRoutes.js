const express = require('express');
const router = express.Router();

// Importare functii din controller
const { trimiteMesaj, getToateMesajele } = require('../controllers/messageController');

// Importare middleware-uri de securitate
const { protejeazaRuta, doarAdmin } = require('../middlewares/authMiddleware');

// -------------------------------------------------------------------------
// RUTE PENTRU MESAJE CONTACT
// -------------------------------------------------------------------------

// 1. Trimitere mesaj nou (Public)
router.post('/', trimiteMesaj);

// 2. Preluare istoric mesaje (Protejat: Doar Administrator)
router.get('/', protejeazaRuta, doarAdmin, getToateMesajele);

module.exports = router;