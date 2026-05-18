const express = require('express');

const db = require('../db/connection');

const router = express.Router();

router.get('/', (req, res) => {
    db.query('SELECT * FROM clients', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.post('/', (req, res) => {
    const { full_name, activity_type_id, notes, date_of_birth } = req.body;
    const query = 'INSERT INTO clients (full_name, activity_type_id, notes, date_of_birth) VALUES (?, ?, ?, ?)';

    db.query(query, [full_name, activity_type_id, notes, date_of_birth], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, status: 'Created' });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM clients WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Not Found' });

        res.json({ message: `Client ${id} deleted` });
    });
});

module.exports = router;
