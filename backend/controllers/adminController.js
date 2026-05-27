const User = require('../models/User');

// 1. Preluare lista distribuitori in asteptare
const getDistribuitoriInAsteptare = async (req, res) => {
    try {
        const distribuitori = await User.find({ rol: 'distribuitor', aprobat: false });
        res.status(200).json(distribuitori);
    } catch (error) {
        console.error('[AdminController] Eroare preluare distribuitori:', error);
        res.status(500).json({ mesaj: 'Eroare interna la preluarea datelor.' });
    }
};

// 2. Aprobare cont distribuitor
const aprobaDistribuitor = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { aprobat: true }, { new: true });
        
        if (!user) {
            return res.status(404).json({ mesaj: 'Distribuitorul nu a fost gasit.' });
        }

        res.status(200).json({ mesaj: 'Contul de distribuitor a fost aprobat.' });
    } catch (error) {
        console.error('[AdminController] Eroare aprobare distribuitor:', error);
        res.status(500).json({ mesaj: 'Eroare interna la actualizarea statusului.' });
    }
};

module.exports = { getDistribuitoriInAsteptare, aprobaDistribuitor };