const Order = require('../models/Order');
const Product = require('../models/Product');

// 1. Plasare comanda (Client)
const plaseazaComanda = async (req, res) => {
    try {
        const { produse, adresaLivrare, dateFacturare, metodaPlata } = req.body;

        if (!produse || produse.length === 0) {
            return res.status(400).json({ mesaj: 'Cosul de cumparaturi este gol.' });
        }

        let totalCalculat = 0;

        // Verificam stocurile inainte de a plasa comanda
        for (const item of produse) {
            const produsDb = await Product.findById(item.id);
            if (!produsDb) {
                return res.status(404).json({ mesaj: `Produsul ${item.nume} nu a fost gasit in baza de date.` });
            }
            if (produsDb.stoc < item.cantitate) {
                return res.status(400).json({ mesaj: `Stoc insuficient pentru produsul: ${item.nume}.` });
            }
            totalCalculat += produsDb.pret * item.cantitate;
        }

        const comandaNoua = new Order({
            client: req.user.id,
            produse: produse.map(p => ({
                produsId: p.id,
                nume: p.nume,
                pret: p.pret,
                cantitate: p.cantitate
            })),
            total: totalCalculat,
            adresaLivrare,
            dateFacturare,
            metodaPlata
        });

        await comandaNoua.save();

        // Actualizam stocurile dupa confirmarea comenzii
        for (const item of produse) {
            const produsDb = await Product.findById(item.id);
            produsDb.stoc -= item.cantitate;
            await produsDb.save();
        }

        res.status(201).json({ mesaj: 'Comanda a fost inregistrata cu succes.', comandaId: comandaNoua._id });
    } catch (error) {
        console.error('[OrderController] Eroare la plasarea comenzii:', error);
        res.status(500).json({ mesaj: 'Eroare interna la procesarea comenzii.' });
    }
};

// 2. Preluare istoric comenzi personale (Client)
const getComenzileMele = async (req, res) => {
    try {
        const comenzi = await Order.find({ client: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(comenzi);
    } catch (error) {
        console.error('[OrderController] Eroare la preluarea istoricului clientului:', error);
        res.status(500).json({ mesaj: 'Eroare interna la aducerea istoricului de comenzi.' });
    }
};

// 3. Preluare toate comenzile (Distribuitor/Admin)
const getToateComenzile = async (req, res) => {
    try {
        const comenzi = await Order.find().sort({ createdAt: -1 }).populate('client', 'nume email');
        res.status(200).json(comenzi);
    } catch (error) {
        console.error('[OrderController] Eroare la preluarea tuturor comenzilor:', error);
        res.status(500).json({ mesaj: 'Eroare interna la aducerea comenzilor globale.' });
    }
};

// 4. Actualizare status comanda (Distribuitor/Admin)
const updateStatusComanda = async (req, res) => {
    try {
        const { status } = req.body;
        const comanda = await Order.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true } 
        );

        if (!comanda) {
            return res.status(404).json({ mesaj: 'Comanda specificata nu a fost gasita.' });
        }

        res.status(200).json({ mesaj: 'Statusul comenzii a fost actualizat cu succes.', comanda });
    } catch (error) {
        console.error('[OrderController] Eroare la actualizarea statusului:', error);
        res.status(500).json({ mesaj: 'Eroare interna la actualizarea statusului comenzii.' });
    }
};

module.exports = { plaseazaComanda, getComenzileMele, getToateComenzile, updateStatusComanda };