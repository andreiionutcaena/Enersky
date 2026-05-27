const jwt = require('jsonwebtoken');

// 1. Verificare token (Autentificare generala)
const protejeazaRuta = (req, res, next) => {
    let token = req.headers.authorization;
    
    if (token && token.startsWith('Bearer')) {
        try {
            token = token.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; 
            next();
        } catch (error) {
            console.error('[AuthMiddleware] Eroare verificare token:', error);
            res.status(401).json({ mesaj: 'Neautorizat. Token invalid sau expirat.' });
        }
    } else {
        res.status(401).json({ mesaj: 'Neautorizat. Lipseste token-ul de acces.' });
    }
};

// 2. Autorizare rol Distribuitor
const doarDistribuitor = (req, res, next) => {
    if (req.user && req.user.rol === 'distribuitor') {
        next(); 
    } else {
        res.status(403).json({ mesaj: 'Acces interzis. Sunt necesare privilegii de Distribuitor.' });
    }
};

// 3. Autorizare rol Administrator
const doarAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'admin') {
        next(); 
    } else {
        res.status(403).json({ mesaj: 'Acces interzis. Sunt necesare privilegii de Administrator.' });
    }
};

module.exports = { protejeazaRuta, doarDistribuitor, doarAdmin };