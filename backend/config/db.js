const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Ne conectăm la adresa din fișierul .env
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`🔥 Forță! Baza de date a fost conectată: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Eroare la conectare: ${error.message}`);
        process.exit(1); // Oprește serverul dacă pică baza de date
    }
};

module.exports = connectDB;