const Message = require('../models/Message');

// 1. Trimitere mesaj nou (Contact)
const trimiteMesaj = async (req, res) => {
    try {
        const { nume, email, subiect, mesaj } = req.body;

        if (!nume || !email || !subiect || !mesaj) {
            return res.status(400).json({ eroare: 'Toate campurile sunt obligatorii.' });
        }

        if (!email.includes('@')) {
            return res.status(400).json({ eroare: 'Adresa de email nu este valida.' });
        }

        const mesajNou = new Message({ nume, email, subiect, mesaj });
        await mesajNou.save();

        res.status(201).json({ succes: 'Mesajul a fost inregistrat si trimis cu succes.' });
    } catch (error) {
        console.error('[MessageController] Eroare la trimiterea mesajului:', error);
        res.status(500).json({ eroare: 'Eroare interna a serverului.' });
    }
};

// 2. Preluare toate mesajele (Pentru Admin)
const getToateMesajele = async (req, res) => {
    try {
        const mesaje = await Message.find().sort({ createdAt: -1 });
        res.status(200).json(mesaje);
    } catch (error) {
        console.error('[MessageController] Eroare la preluarea mesajelor:', error);
        res.status(500).json({ eroare: 'Eroare interna la preluarea datelor.' });
    }
};

module.exports = { trimiteMesaj, getToateMesajele };