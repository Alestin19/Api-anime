const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Configuración de la base de datos
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Crear la tabla de animes si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS animes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      genre TEXT,
      release_year INTEGER,
      rating REAL
    )
  `);
});

// Obtener todos los animes
app.get('/animes', (req, res) => {
  db.all("SELECT * FROM animes", [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

// Agregar un nuevo anime
app.post('/animes', (req, res) => {
  const { title, genre, release_year, rating } = req.body;
  if (title && release_year) {
    db.run(
      "INSERT INTO animes (title, genre, release_year, rating) VALUES (?, ?, ?, ?)",
      [title, genre, release_year, rating],
      function (err) {
        if (err) {
          return res.status(500).json({ message: 'Error al agregar el anime' });
        }
        res.status(201).json({ message: 'Anime agregado', id: this.lastID });
      }
    );
  } else {
    res.status(400).json({ message: 'Datos del anime inválidos' });
  }
});

// Eliminar un anime
app.delete('/animes/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM animes WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Error al eliminar el anime' });
    }
    res.json({ message: 'Anime eliminado' });
  });
});

app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
