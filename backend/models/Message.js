const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    nume: { type: String, required: true },
    email: { type: String, required: true },
    subiect: { type: String, required: true },
    mesaj: { type: String, required: true },
    citit: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);