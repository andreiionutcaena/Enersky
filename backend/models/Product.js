const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nume: { type: String, required: true },
    categorie: { type: String, required: true },
    pret: { type: Number, required: true },
    descriere: { type: String },
    stoc: { type: Number, default: 0 },
    imagine: { type: String },
    specificatii: { type: String },
    distribuitor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);