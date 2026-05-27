const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// 1. Initializare aplicatie
const app = express();

// 2. Configurare Middleware-uri
app.use(cors());
app.use(express.json());

// 3. Import Rute
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');

// 4. Inregistrare Rute API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// 5. Conexiune Baza de Date (MongoDB)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('[MongoDB] Conexiune stabilita cu succes.'))
    .catch((err) => console.error('[MongoDB] Eroare la conectare:', err));

// 6. Ruta de test (Healthcheck)
app.get('/', (req, res) => {
    res.status(200).send('Enersky API este online.');
});

// 7. Pornire Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`[Server] Aplicatia ruleaza pe portul ${PORT}`);
});