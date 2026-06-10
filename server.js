
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'amirb1383',
    database: 'music_player'
};


app.use(express.static(path.join(__dirname, '.')));

app.use('/covers', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
app.use('/covers', express.static(path.join(__dirname,'covers')));





app.get('/', (req, res) => {
    res.send('Music Player Server is Running!');
});


app.get('/api/songs', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [songs] = await connection.execute('SELECT * FROM songs');
        res.json(songs);
    } catch (error) {
        console.error('Error fetching songs:', error);
        res.status(500).json({ error: 'Failed to fetch songs' });
    } finally {
        if (connection) connection.end();
    }
});


app.patch('/api/songs/:id/favorite', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { fav } = req.body;
        connection = await mysql.createConnection(dbConfig);
        await connection.execute('UPDATE songs SET fav = ? WHERE id = ?', [fav ? 1 : 0, id]);
        res.json({ success: true, id, fav });
    } catch (error) {
        console.error('Error updating favorite:', error);
        res.status(500).json({ error: 'Failed to update favorite' });
    } finally {
        if (connection) connection.end();
    }
});


app.delete('/api/songs/:id', async (req, res) => {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    await conn.execute('DELETE FROM songs WHERE id = ?', [req.params.id]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});


app.use('/songs', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
app.use('/songs', express.static(path.join(__dirname, 'songs')));


app.use(express.static(path.join(__dirname, '.')));  

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


