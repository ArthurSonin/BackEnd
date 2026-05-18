const express = require('express');
const Client = require('../db/client');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const clients = await Client.find();
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newClient = new Client(req.body);
        await newClient.save();
        res.status(201).json(newClient);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const result = await Client.findByIdAndDelete(req.params.id);

        if (result) {
            res.send('Клієнта видалено успішно');
        } else {
            res.status(404).send('Клієнта не знайдено');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
