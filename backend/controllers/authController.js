const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// -------------------------------------------------------------------------
// CONFIGURARE SERVICIU DE EMAIL (NODEMAILER)
// -------------------------------------------------------------------------
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'Placeholder_USER',
        pass: 'Placeholder_PASSWORD' 
    }
});

// -------------------------------------------------------------------------
// 1. INREGISTRARE UTILIZATOR
// -------------------------------------------------------------------------
const registerUser = async (req, res) => {
    try {
        const { nume, numeFirma, email, parola, rol, cui } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ mesaj: 'Acest email este deja asociat unui cont.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(parola, salt);
        const tokenUnic = crypto.randomBytes(20).toString('hex');

        const newUser = new User({
            nume, 
            numeFirma, 
            email, 
            parola: hashedPassword, 
            rol, 
            cui,
            tokenConfirmare: tokenUnic,
            confirmat: false 
        });
        
        await newUser.save();

        const linkConfirmare = `http://localhost:5000/api/auth/confirma/${tokenUnic}`;
        let subiectEmail = 'Confirmare inregistrare cont Enersky';
        let mesajEmail = `Stimate/a ${nume},\n\nVa multumim pentru inregistrarea in platforma Enersky.\n\nPentru a va activa contul, va rugam sa accesati urmatorul link:\n${linkConfirmare}\n\nO zi excelenta,\nEchipa Enersky`;

        if (rol === 'distribuitor' || rol === 'firma') {
            const numeCompanie = numeFirma || 'compania dvs.';
            subiectEmail = 'Inregistrare Enersky - Confirmare Email si Verificare Cont';
            mesajEmail = `Stimate/a ${nume} (reprezentant ${numeCompanie}),\n\nPasul 1: Va rugam sa confirmati adresa de email accesand link-ul de mai jos:\n${linkConfirmare}\n\nPasul 2: Echipa noastra va procesa si verifica datele firmei (CUI: ${cui}) pentru aprobarea finala a contului.\n\nEchipa Enersky`;
        }

        try {
            await transporter.sendMail({
                from: '"Echipa Enersky" <suport@enersky.ro>',
                to: email,
                subject: subiectEmail,
                text: mesajEmail
            });
            console.log(`[AuthController] Email de confirmare trimis catre: ${email}`);
        } catch (mailErr) {
            console.error('[AuthController] Eroare la trimiterea emailului:', mailErr);
        }

        res.status(201).json({ mesaj: 'Cont creat cu succes. Va rugam sa verificati casuta de email pentru activare.' });

    } catch (error) {
        console.error('[AuthController] Eroare la inregistrare:', error);
        res.status(500).json({ mesaj: 'Eroare interna a serverului.' });
    }
};

// -------------------------------------------------------------------------
// 2. AUTENTIFICARE (LOGIN)
// -------------------------------------------------------------------------
const loginUser = async (req, res) => {
    try {
        const { email, parola } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ mesaj: 'Email sau parola incorecta.' });
        }

        if (!user.confirmat) {
            return res.status(403).json({ mesaj: 'Contul nu este activat. Va rugam sa accesati link-ul de confirmare trimis pe email.' });
        }

        if (!user.aprobat) {
            return res.status(403).json({ mesaj: 'Adresa de email a fost confirmata, insa contul necesita aprobarea unui administrator.' });
        }

        const isMatch = await bcrypt.compare(parola, user.parola);
        if (!isMatch) {
            return res.status(400).json({ mesaj: 'Email sau parola incorecta.' });
        }

        const token = jwt.sign(
            { id: user._id, rol: user.rol }, 
            process.env.JWT_SECRET || 'cheie_secreta_temporara', 
            { expiresIn: '30d' }
        );

        res.status(200).json({
            mesaj: 'Autentificare reusita.',
            token,
            user: { id: user._id, nume: user.nume, email: user.email, rol: user.rol, cui: user.cui }
        });

    } catch (error) {
        console.error('[AuthController] Eroare la autentificare:', error);
        res.status(500).json({ mesaj: 'Eroare interna a serverului.' });
    }
};

// -------------------------------------------------------------------------
// 3. CONFIRMARE ADRESA DE EMAIL (Ruta GET accesata din email)
// -------------------------------------------------------------------------
const confirmaEmail = async (req, res) => {
    try {
        const tokenPrimit = req.params.token;
        const user = await User.findOne({ tokenConfirmare: tokenPrimit });

        if (!user) {
            return res.status(400).send(`
                <div style="text-align: center; margin-top: 50px; font-family: sans-serif;">
                    <h2 style="color: #e74c3c;">Link-ul de confirmare este invalid sau a expirat.</h2>
                </div>
            `);
        }

        user.confirmat = true;
        user.tokenConfirmare = undefined;
        await user.save();

        res.status(200).send(`
            <div style="text-align: center; margin-top: 50px; font-family: sans-serif;">
                <h2 style="color: #27ae60;">Contul dumneavoastra a fost activat cu succes.</h2>
                <br>
                <a href="http://127.0.0.1:5500/frontend/login.html" style="background: #2c3e50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Autentificare Enersky</a>
            </div>
        `);
    } catch (error) {
        console.error('[AuthController] Eroare la confirmarea emailului:', error);
        res.status(500).send('Eroare interna la activarea contului.');
    }
};

// -------------------------------------------------------------------------
// 4. RECUPERARE PAROLA (Trimitere link resetare)
// -------------------------------------------------------------------------
const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ mesaj: 'Nu a fost gasit niciun cont asociat cu aceasta adresa de email.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000; 
        await user.save();

        const resetUrl = `http://127.0.0.1:5500/frontend/login.html?resetToken=${resetToken}`;
        const mesajEmail = `Stimate/a ${user.nume},\n\nAti solicitat resetarea parolei pentru contul Enersky.\n\nVa rugam sa accesati link-ul urmator pentru a seta o noua parola:\n${resetUrl}\n\nDaca nu ati initiat aceasta cerere, va rugam sa ignorati acest mesaj.\n\nEchipa Enersky`;

        await transporter.sendMail({
            from: '"Echipa Enersky" <suport@enersky.ro>',
            to: user.email,
            subject: 'Recuperare Parola Cont Enersky',
            text: mesajEmail
        });

        res.status(200).json({ mesaj: 'Instructiunile pentru resetarea parolei au fost trimise pe adresa dvs. de email.' });
    } catch (error) {
        console.error('[AuthController] Eroare la recuperarea parolei:', error);
        res.status(500).json({ mesaj: 'Eroare interna a serverului.' });
    }
};

// -------------------------------------------------------------------------
// 5. SETARE PAROLA NOUA
// -------------------------------------------------------------------------
const resetPassword = async (req, res) => {
    try {
        const resetToken = req.params.token;
        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpire: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ mesaj: 'Link-ul de resetare este invalid sau a expirat.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.parola = await bcrypt.hash(req.body.parola, salt);
        
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ mesaj: 'Parola a fost actualizata cu succes. Va puteti autentifica folosind noua parola.' });
    } catch (error) {
        console.error('[AuthController] Eroare la resetarea parolei:', error);
        res.status(500).json({ mesaj: 'Eroare interna a serverului.' });
    }
};

// -------------------------------------------------------------------------
// 6. ACTUALIZARE DATE PROFIL
// -------------------------------------------------------------------------
const updateProfile = async (req, res) => {
    try {
        const { nume, numeFirma, cui } = req.body;
        const user = await User.findById(req.user.id); 

        if (!user) {
            return res.status(404).json({ mesaj: 'Utilizatorul nu a fost gasit in sistem.' });
        }

        user.nume = nume || user.nume;
        user.numeFirma = numeFirma !== undefined ? numeFirma : user.numeFirma;
        user.cui = cui !== undefined ? cui : user.cui;

        await user.save();

        res.status(200).json({
            mesaj: 'Datele profilului au fost actualizate cu succes.',
            user: { id: user._id, nume: user.nume, email: user.email, rol: user.rol, cui: user.cui, numeFirma: user.numeFirma }
        });
    } catch (error) {
        console.error('[AuthController] Eroare la actualizarea profilului:', error);
        res.status(500).json({ mesaj: 'Eroare interna a serverului.' });
    }
};

module.exports = { registerUser, loginUser, confirmaEmail, forgotPassword, resetPassword, updateProfile };
