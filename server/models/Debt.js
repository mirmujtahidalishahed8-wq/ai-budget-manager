const mongoose = require('mongoose');

const DebtSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    emiAmount: { type: Number, required: true },
    dueDate: { type: Number, required: true }, // 1-31
    status: { type: String, default: 'active' } // active, paid Off
});

module.exports = mongoose.model('Debt', DebtSchema);
