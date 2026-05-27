const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    client: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    produse: [{
        produsId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        nume: { type: String, required: true },
        pret: { type: Number, required: true },
        cantitate: { type: Number, required: true }
    }],
    total: { type: Number, required: true },
    adresaLivrare: { type: String, required: true },
    dateFacturare: { type: String},
    metodaPlata: { 
        type: String, 
        required: true,
        enum: ['Card', 'Apple Pay', 'Google Pay'] // Metodele din PDF
    },
    status: { 
        type: String, 
        default: 'Procesare',
        enum: ['Procesare', 'Expediat', 'Livrat', 'Anulat']
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);