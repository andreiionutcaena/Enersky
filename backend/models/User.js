const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nume: { type: String, required: true }, 
    numeFirma: { type: String }, 
    email: { type: String, required: true, unique: true },
    parola: { type: String, required: true },
    rol: { type: String, enum: ['fizica', 'firma', 'distribuitor', 'admin'], required: true },
    cui: { type: String },
    
    confirmat: { type: Boolean, default: false },
    tokenConfirmare: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    aprobat: { 
        type: Boolean, 
        default: function() {
            return this.rol !== 'distribuitor';
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);