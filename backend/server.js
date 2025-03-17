
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
});

app.use(cors());
app.use(bodyParser.json());


app.get('/liste_abrufen', async (req, res) => {
	const result = await pool.query('SELECT * FROM tasks'); // be -> db, be <- db 
	res.json(result.rows); // fe <- be
});

app.post('/add', async (req, res) => {
	const result = await pool.query(                          // be -> db, be <- db
		'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
		[req.body.title]
	);
	res.json(result.rows[0]);                                 // fe <- be
});

app.delete('/delete/:id', async (req, res) => {
	try {
		const result = await pool.query('DELETE FROM tasks WHERE id = $1', [     // be -> db, be <- db
			req.params.id, 
		]);
		if (result.rowCount !== 1) {
			return res.status(404).json({ error: 'Error Row Count' });           // fe <- be
		}
		res.json({ id: req.params.id });                                         // fe <- be
	} catch (err) {
		res
			.status(500)
			.json({ error: 'An error occurred while deleting the task' });       // fe <- be
	}
});

app.listen(3050, 'localhost', () => {
	console.log('bald wird es Mittagspause');
});