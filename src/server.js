const express = require('express');
const sqlite3 = require('sqlite3').verbose(); // Importer la bibliothèque SQLite
const path = require('path');
const cors = require("cors")

const app = express();
const port = 5501;

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());

app.use(express.static(path.join(__dirname,"public")));

app.use(cors({
    origin:"*",
    methods:['GET']
}))

// Chemin de la base de données SQLite
const dbPath = path.resolve(__dirname, 'gameDB.sqlite');

// Connexion à la base de données SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur lors de la connexion à la base de données SQLite :', err.message);
  } else {
    console.log('Connexion à la base de données SQLite réussie.');
  }
});

// Créer une table pour stocker les données si elle n'existe pas déjà
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS userData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    points INTEGER
  )`);
});

// Route pour enregistrer les données dans la base de données
app.post('/addData', (req, res) => {
  const { username, points } = req.body;

  // Insertion des données dans la base de données
  const sql = `INSERT INTO userData (username, points) VALUES (?, ?)`;
  db.run(sql, [username, points], function(err) {
    if (err) {
      console.error('Erreur lors de l\'enregistrement des données:', err);
      res.sendStatus(500); // Envoyer une réponse d'erreur
    } else {
      console.log('Données enregistrées avec succès dans la base de données.');
      res.sendStatus(200); // ECannot GET /addDatanvoyer une réponse de succès
    }
  });
});

// Route pour récupérer les données des noms et scores depuis la base de données
app.get('/leaderboard', (req, res) => {
  const sql = `SELECT username, points FROM userData ORDER BY points DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des données:', err);
      res.sendStatus(500);
    } else {
      console.log(rows);
      res.json(rows); // Renvoyer les données au format JSON
    }
  });
});





// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
