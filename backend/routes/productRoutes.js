const express = require('express');
const router = express.Router();

// Importare middleware de securitate
const { protejeazaRuta } = require('../middlewares/authMiddleware');

// Importare functii din controller
const { 
    getToateProdusele, 
    getProductById, 
    addProduct, 
    getMyProducts, 
    updateProductsBulk, 
    updateProduct,
    getProduseCumparateImpreuna
} = require('../controllers/productController');

// -------------------------------------------------------------------------
// RUTE GENERALE (Statice, fara id)
// -------------------------------------------------------------------------

// Preluare catalog produse (Public)
router.get('/', getToateProdusele);

// Preluare produse proprii (Protejat: Distribuitor)
router.get('/mele', protejeazaRuta, getMyProducts);

// Actualizare stoc in masa (Protejat: Distribuitor)
router.put('/bulk', protejeazaRuta, updateProductsBulk);

// Adaugare produs nou (Protejat: Distribuitor)
router.post('/', protejeazaRuta, addProduct);

// -------------------------------------------------------------------------
// RUTE CU PARAMETRI DINAMICI (:id)
// -------------------------------------------------------------------------

// Preluare produs dupa ID (Public)
router.get('/:id', getProductById);

// Actualizare produs dupa ID (Protejat: Distribuitor)
router.put('/:id', protejeazaRuta, updateProduct);

// Preluare recomandari produs (Public)
router.get('/:id/impreuna', getProduseCumparateImpreuna);

module.exports = router;