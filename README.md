# Enersky - Platformă pentru Energie Regenerabilă

Enersky este o aplicație web dezvoltată pentru gestionarea și distribuția echipamentelor de energie regenerabilă. Proiectul facilitează legătura dintre distribuitorii de echipamente și clienții finali, incluzând funcționalități de catalog, gestionare comenzi și administrare inventar.

## Tehnologii Utilizate

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Interfață responsivă bazată pe manipulare DOM

### Backend
- Node.js
- Express.js
- JSON Web Tokens (JWT) pentru autentificare

### Baza de date
- MongoDB
- Mongoose (ODM)

## Arhitectură
Proiectul utilizează o arhitectură de tip Client-Server pe trei niveluri:
1. **Prezentare:** Interfață web care comunică asincron cu API-ul.
2. **Logic:** Server API RESTful care gestionează rutele, validările și procesele asincrone.
3. **Persistență:** Bază de date NoSQL pentru stocarea informațiilor despre utilizatori, produse și comenzi.

## Funcționalități principale
- **Autentificare:** Înregistrare și login securizat cu roluri (Client, Distribuitor, Admin).
- **Catalog Produse:** Vizualizarea echipamentelor cu funcții de filtrare.
- **Management Comenzi:** Plasarea comenzilor și monitorizarea statusului acestora.
- **Administrare:** Gestionarea utilizatorilor și a stocurilor prin operațiuni de tip CRUD.
- **Contact:** Modul de mesagerie integrat.
