const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');

// 1. Preluare catalog produse (Public)
const getToateProdusele = async (req, res) => {
    try {
        const produse = await Product.find({});
        res.status(200).json(produse);
    } catch (error) {
        console.error('[ProductController] Eroare preluare catalog:', error);
        res.status(500).json({ mesaj: 'Eroare interna la preluarea produselor.' });
    }
};

// 2. Preluare detalii produs dupa ID (Public)
const getProductById = async (req, res) => {
    try {
        const produs = await Product.findById(req.params.id);
        if (produs) {
            res.status(200).json(produs);
        } else {
            res.status(404).json({ mesaj: 'Produsul nu a fost gasit in sistem.' });
        }
    } catch (error) {
        console.error('[ProductController] Eroare cautare produs:', error);
        res.status(500).json({ mesaj: 'Eroare interna la cautarea produsului.' });
    }
};

// 3. Adaugare produs nou (Distribuitor)
const addProduct = async (req, res) => {
    try {
        const { nume, categorie, pret, descriere, stoc, imagine, specificatii } = req.body;
        
        const produsNou = new Product({
            distribuitor: req.user.id,
            nume,
            categorie,
            pret,
            descriere,
            stoc,
            imagine,
            specificatii
        });

        const produsSalvat = await produsNou.save();
        res.status(201).json({ mesaj: 'Produsul a fost adaugat cu succes.', produs: produsSalvat });
    } catch (error) {
        console.error('[ProductController] Eroare adaugare produs:', error);
        res.status(500).json({ mesaj: 'Eroare interna la adaugarea produsului.' });
    }
};

// 4. Preluare produse proprii (Distribuitor)
const getMyProducts = async (req, res) => {
    try {
        const produse = await Product.find({ distribuitor: req.user.id });
        res.status(200).json(produse);
    } catch (error) {
        console.error('[ProductController] Eroare preluare produse proprii:', error);
        res.status(500).json({ mesaj: 'Eroare interna la preluarea inventarului.' });
    }
};

// 5. Actualizare stoc in masa via CSV (Distribuitor)
const updateProductsBulk = async (req, res) => {
    try {
        const { updates } = req.body;
        let successCount = 0;
        let errors = [];

        for (let update of updates) {
            try {
                const produs = await Product.findOne({ _id: update.id, distribuitor: req.user.id });
                if (produs) {
                    produs.pret = update.pret !== undefined ? update.pret : produs.pret;
                    produs.stoc = update.stoc !== undefined ? update.stoc : produs.stoc;
                    await produs.save();
                    successCount++;
                } else {
                    errors.push(`ID ${update.id}: Produs negasit sau acces restrictionat.`);
                }
            } catch (err) {
                errors.push(`ID ${update.id}: Format invalid.`);
            }
        }

        res.status(200).json({ 
            mesaj: `Procesare finalizata. ${successCount} produse actualizate.`, 
            erori: errors 
        });
    } catch (error) {
        console.error('[ProductController] Eroare actualizare bulk:', error);
        res.status(500).json({ mesaj: 'Eroare interna la procesarea actualizarii in masa.' });
    }
};

// 6. Actualizare individuala produs (Distribuitor)
const updateProduct = async (req, res) => {
    try {
        const { nume, pret, stoc } = req.body;
        
        const produs = await Product.findOne({ _id: req.params.id, distribuitor: req.user.id });

        if (!produs) {
            return res.status(404).json({ mesaj: 'Produsul nu a fost gasit sau permisiune respinsa.' });
        }

        produs.nume = nume || produs.nume;
        produs.pret = pret !== undefined ? pret : produs.pret;
        produs.stoc = stoc !== undefined ? stoc : produs.stoc;

        const produsActualizat = await produs.save();
        res.status(200).json({ mesaj: 'Produsul a fost actualizat cu succes.', produs: produsActualizat });

    } catch (error) {
        console.error('[ProductController] Eroare actualizare produs:', error);
        res.status(500).json({ mesaj: 'Eroare interna la actualizarea produsului.' });
    }
};

// 7. Preluare recomandari - Cross-selling (Public)
const getProduseCumparateImpreuna = async (req, res) => {
    try {
        const produsId = req.params.id;

        let formateCautare = [produsId];
        if (mongoose.Types.ObjectId.isValid(produsId)) {
            formateCautare.push(new mongoose.Types.ObjectId(produsId));
        }

        const comenzi = await Order.find({
            'produse.produsId': { $in: formateCautare }
        });

        if (!comenzi || comenzi.length === 0) {
            return res.status(200).json([]); 
        }

        let alteProduseIds = [];
        
        comenzi.forEach(comanda => {
            comanda.produse.forEach(item => {
                const itemId = item.produsId;
                if (itemId && itemId.toString() !== produsId) {
                    alteProduseIds.push(itemId.toString());
                }
            });
        });

        const frecventa = {};
        alteProduseIds.forEach(id => {
            frecventa[id] = (frecventa[id] || 0) + 1;
        });

        const topIds = Object.keys(frecventa)
            .sort((a, b) => frecventa[b] - frecventa[a])
            .slice(0, 4);

        if (topIds.length === 0) {
            return res.status(200).json([]);
        }

        const produseRecomandate = await Product.find({ _id: { $in: topIds } });
        res.status(200).json(produseRecomandate);

    } catch (error) {
        console.error("[ProductController] Eroare generare recomandari:", error);
        res.status(500).json({ mesaj: 'Eroare interna la calcularea recomandarilor.' });
    }
};

module.exports = {
    getToateProdusele,
    getProductById,
    addProduct,
    getMyProducts,
    updateProductsBulk,
    updateProduct,
    getProduseCumparateImpreuna
};