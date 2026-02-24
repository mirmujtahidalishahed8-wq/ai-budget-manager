const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Debt = require('../models/Debt');

// --- TRANSACTIONS ---

// Get all
router.get('/transactions', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Create
router.post('/transactions', auth, async (req, res) => {
    const { type, category, amount, description } = req.body;
    try {
        const newTx = new Transaction({
            user: req.user.id,
            type,
            category,
            amount,
            description
        });
        const tx = await newTx.save();
        res.json(tx);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update
router.put('/transactions/:id', auth, async (req, res) => {
    const { type, category, amount, description } = req.body;
    try {
        let tx = await Transaction.findById(req.params.id);
        if (!tx) return res.status(404).json({ msg: 'Not found' });
        if (tx.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        tx = await Transaction.findByIdAndUpdate(req.params.id, 
            { $set: { type, category, amount, description } }, 
            { new: true }
        );
        res.json(tx);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Delete
router.delete('/transactions/:id', auth, async (req, res) => {
    try {
        let tx = await Transaction.findById(req.params.id);
        if (!tx) return res.status(404).json({ msg: 'Not found' });
        if (tx.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        await Transaction.findByIdAndRemove(req.params.id);
        res.json({ msg: 'Transaction removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});


// --- DEBTS ---

// Get all
router.get('/debts', auth, async (req, res) => {
    try {
        const debts = await Debt.find({ user: req.user.id });
        res.json(debts);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Create
router.post('/debts', auth, async (req, res) => {
    const { name, totalAmount, remainingAmount, emiAmount, dueDate } = req.body;
    try {
        const newDebt = new Debt({
            user: req.user.id,
            name,
            totalAmount,
            remainingAmount,
            emiAmount,
            dueDate
        });
        const debt = await newDebt.save();
        res.json(debt);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update
router.put('/debts/:id', auth, async (req, res) => {
    const { name, totalAmount, remainingAmount, emiAmount, dueDate } = req.body;
    try {
        let debt = await Debt.findById(req.params.id);
        if (!debt) return res.status(404).json({ msg: 'Not found' });
        if (debt.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        debt = await Debt.findByIdAndUpdate(req.params.id, 
            { $set: { name, totalAmount, remainingAmount, emiAmount, dueDate } }, 
            { new: true }
        );
        res.json(debt);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Delete
router.delete('/debts/:id', auth, async (req, res) => {
    try {
        let debt = await Debt.findById(req.params.id);
        if (!debt) return res.status(404).json({ msg: 'Not found' });
        if (debt.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        await Debt.findByIdAndRemove(req.params.id);
        res.json({ msg: 'Debt record removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
