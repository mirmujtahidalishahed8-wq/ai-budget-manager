const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Debt = require('./models/Debt');

const seedData = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/ai-budget-db');
        console.log('🌱 Seeding database...');

        // Clear existing
        await User.deleteMany({});
        await Transaction.deleteMany({});
        await Debt.deleteMany({});

        // 1. Create User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        const user = await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: hashedPassword
        });

        // 2. Create Transactions
        await Transaction.create([
            { user: user._id, type: 'income', category: 'Salary', amount: 5000, description: 'Monthly paycheck' },
            { user: user._id, type: 'expense', category: 'Rent', amount: 1500, description: 'Downtown apartment' },
            { user: user._id, type: 'expense', category: 'Dining Out', amount: 200, description: 'Steakhouse dinner' },
            { user: user._id, type: 'expense', category: 'Groceries', amount: 300 },
            { user: user._id, type: 'expense', category: 'Netflix', amount: 15 },
            { user: user._id, type: 'expense', category: 'Starbucks', amount: 60 }
        ]);

        // 3. Create Debts
        await Debt.create([
            { user: user._id, name: 'Student Loan', totalAmount: 25000, remainingAmount: 18000, emiAmount: 400, dueDate: 1 },
            { user: user._id, name: 'Car Loan', totalAmount: 15000, remainingAmount: 5000, emiAmount: 350, dueDate: 15 }
        ]);

        console.log('✅ Database Seeded Successfully!');
        console.log('User: john@example.com / password123');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
