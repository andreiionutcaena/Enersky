const express = require('express');
const router = express.Router();

// Importare functii din controller
const { 
    plaseazaComanda, 
    getComenzileMele, 
    getToateComenzile, 
    updateStatusComanda 
} = require('../controllers/orderController');

// Importare middleware-uri de securitate
const { protejeazaRuta, doarDistribuitor } = require('../middlewares/authMiddleware');

// -------------------------------------------------------------------------
// RUTE PENTRU COMENZI - CLIENTI
// -------------------------------------------------------------------------

// 1. Plasare comanda
router.post('/', protejeazaRuta, plaseazaComanda);

// 2. Vizualizare istoric personal
router.get('/mele', protejeazaRuta, getComenzileMele);

// -------------------------------------------------------------------------
// RUTE PENTRU COMENZI - DISTRIBUITOR / ADMIN
// -------------------------------------------------------------------------

// 3. Vizualizare toate comenzile din sistem
router.get('/admin/toate', protejeazaRuta, doarDistribuitor, getToateComenzile);

// 4. Actualizare status comanda
router.put('/:id/status', protejeazaRuta, doarDistribuitor, updateStatusComanda);

module.exports = router;