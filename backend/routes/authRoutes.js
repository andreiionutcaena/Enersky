const express = require('express');
const router = express.Router();

// Importare functii din controller
const { 
    registerUser, 
    loginUser, 
    confirmaEmail, 
    forgotPassword, 
    resetPassword, 
    updateProfile 
} = require('../controllers/authController');

// Importare middleware de securitate
const { protejeazaRuta } = require('../middlewares/authMiddleware');

// -------------------------------------------------------------------------
// RUTE PENTRU AUTENTIFICARE SI CONT
// -------------------------------------------------------------------------

// 1. Inregistrare utilizator nou
router.post('/register', registerUser);

// 2. Autentificare (Login)
router.post('/login', loginUser);

// 3. Confirmare adresa de email (Accesata din link-ul de pe mail)
router.get('/confirma/:token', confirmaEmail);

// 4. Cerere recuperare parola (Genereaza si trimite link)
router.post('/forgot-password', forgotPassword);

// 5. Setare parola noua
router.put('/reset-password/:token', resetPassword);

// 6. Actualizare date profil (Ruta protejata, necesita token valid)
router.put('/update', protejeazaRuta, updateProfile);

module.exports = router;