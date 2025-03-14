const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

//TODO: Verbinde eine Datenbank dazu

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
})

app.use(cors());                // Middleware
app.use(bodyParser.json());     // Middleware (wie ein Übersetzer)

//TODO: Schreibe requests/responses


// Liste mir alle existierende Items
// hier sollte nur alle Items als JSON im Response geschrieben werden
app.get('/liste_abrufen', async (req, res) => {
    const result = await pool.query('SELECT * FROM tasks')
    res.json(result.rows)
});

// Wenn ein neues Item hinzugefügt werden soll, soll NodeJS Server diesen Request so behandeln:
app.post('/add', async (req, res) => {
    console.log("POST kommt an")
    const result = await pool.query('INSERT INTO tasks (title) VALUES ($1)', [req.body.title])
    console.log(result.rows) // !hier ist noch etwas falsch
    res.json(result.rows)


    // db.run('INSERT INTO tasks (title) VALUES (?)', [req.body.title], function () {
    //     res.json({id: this.lastID, title: req.body.title, completed: 0});
    // });

});



// app.delete('/delete/:id', (req, res) => {
//     db.run('DELETE FROM tasks WHERE id = ?', req.params.id, () =>{res.json({message: "Eingabe gelöscht"})});
// })


app.listen(3050, "localhost", () => {
    console.log("bald wird es Mittagspause")
});