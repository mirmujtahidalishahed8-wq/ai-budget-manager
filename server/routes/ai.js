const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Debt = require('../models/Debt');

// @route   GET api/ai/insights
// @desc    Get AI generated financial insights
// @access  Private
router.get('/insights', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id });
        const debts = await Debt.find({ user: req.user.id });

        // 1. Calculate Financial Health
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        const balance = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

        // 2. Generate Recommendations (Mock AI Logic)
        let recommendations = [];
        if (savingsRate < 20) {
            recommendations.push("Your savings rate is below 20%. Try the 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings.");
        } else {
            recommendations.push("Great job! You're saving more than 20% of your income. Consider investing the surplus.");
        }

        if (totalExpense > totalIncome) {
            recommendations.push("Warning: You are spending more than you earn. Review your 'Wants' category immediately.");
        }

        const foodExpense = transactions.filter(t => t.category.toLowerCase().includes('food') || t.category.toLowerCase().includes('eat'))
            .reduce((acc, t) => acc + t.amount, 0);

        if (foodExpense > (0.15 * totalIncome)) {
            recommendations.push("You're spending a lot on food/dining. Cooking at home could save you $200+ this month.");
        }

        // 3. Prediction (Basic Linear)
        const nextMonthBalance = balance + (totalIncome - totalExpense);

        // 4. Alerts
        let alerts = [];
        const upcomingDebts = debts.filter(d => d.remainingAmount > 0);
        upcomingDebts.forEach(d => {
            if (d.dueDate <= 5) { // If due in first 5 days of month
                alerts.push({ type: 'warning', message: `Upcoming EMI: ${d.name} ($${d.emiAmount}) is due on the ${d.dueDate}th.` });
            }
        });

        if (balance < 500) {
            alerts.push({ type: 'danger', message: "Low Balance Alert: Your current funds are below $500. Avoid non-essential purchases." });
        }

        res.json({
            financialHealth: {
                totalIncome,
                totalExpense,
                balance,
                savingsRate
            },
            recommendations,
            prediction: {
                nextMonthBalance,
                message: nextMonthBalance > balance ? "On track to grow your wealth." : "Predicted balance decline next month."
            },
            alerts
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Mock Price Database for affordability checks
const priceDatabase = {
    "iphone 15": 799,
    "iphone 16": 899,
    "iphone 16 pro": 999,
    "tesla model 3": 38990,
    "tesla model y": 44990,
    "macbook air": 999,
    "macbook pro": 1599,
    "ps5": 499,
    "xbox": 499,
    "coffee": 5,
    "netflix": 15,
    "lamborghini": 250000,
    "ferrari": 300000,
    "fortuner": 40000,
    "thar": 18000,
    "scorpio": 20000,
    "creta": 15000,
    "swift": 8000
};

// @route   POST api/ai/chat
// @desc    Conversational AI interface
// @access  Private
router.post('/chat', auth, async (req, res) => {
    const { question } = req.body;

    try {
        const transactions = await Transaction.find({ user: req.user.id });
        const debts = await Debt.find({ user: req.user.id });

        const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        const currentBalance = totalIncome - totalExpense;

        let q = question.toLowerCase();

        // 1. Check Affordability Patterns
        if (q.includes('can i afford') || q.includes('should i buy') || q.includes('buy a')) {
            // Extract item name
            let item = null;
            Object.keys(priceDatabase).forEach(key => {
                if (q.includes(key)) item = key;
            });

            // Improved extraction: if no match in DB, try to find the word after "buy a" or "afford "
            if (!item) {
                const words = q.split(' ');
                const index = words.indexOf('buy') !== -1 ? words.indexOf('buy') + 1 : words.indexOf('afford') + 1;
                if (index > 0 && index < words.length) {
                    item = words[index] === 'a' || words[index] === 'an' ? words[index + 1] : words[index];
                }
            }

            if (item && priceDatabase[item]) {
                const price = priceDatabase[item];
                if (price > currentBalance) {
                    return res.json({ answer: `Are you joking? The ${item} costs $${price}, and you only have $${currentBalance.toFixed(2)}. You're broke. Save up first! 💀` });
                } else if (price > (currentBalance * 0.5)) {
                    return res.json({ answer: `Technically you can afford the ${item} ($${price}), but it will eat up more than 50% of your remaining cash. I'd wait if I were you. 🤨` });
                } else {
                    return res.json({ answer: `Go for it! The ${item} is $${price}, and you've got $${currentBalance.toFixed(2)}. It's a safe buy. ✅` });
                }
            } else if (item) {
                // If item found but not in DB, try to extract price if user provided it "buy a chair for 50"
                const priceMatch = q.match(/\$?(\d+)/);

                // FIX: Check if the matched number is likely a year (e.g. 2024, 2025)
                let extractedPrice = null;
                if (priceMatch) {
                    const matchedValue = parseInt(priceMatch[1]);
                    // If it's between 1900 and 2100, assume it's a year unless it's prefixed with $
                    const isYear = matchedValue >= 1990 && matchedValue <= 2050 && !q.includes('$');

                    if (!isYear) {
                        extractedPrice = matchedValue;
                    }
                }

                if (extractedPrice) {
                    if (extractedPrice > currentBalance) {
                        return res.json({ answer: `That costs $${extractedPrice}, but you only have $${currentBalance.toFixed(2)}. The math says NO. ❌` });
                    } else {
                        return res.json({ answer: `You have $${currentBalance.toFixed(2)}, so $${extractedPrice} is manageable. Just don't make it a habit. 🛒` });
                    }
                }

                return res.json({ answer: `I'm not sure how much a ${item} costs. If you tell me the price, I can give you a better roast... I mean, advice.` });
            }

            return res.json({ answer: "What exactly do you want to buy? Mention a specific item like 'iPhone 16' or a Tesla." });
        }

        // 2. Summary Patterns
        if (q.includes('status') || q.includes('how am i doing') || q.includes('summary')) {
            const status = currentBalance > 0 ? "in the green" : "bleeding money";
            return res.json({ answer: `You are currently ${status}. Your balance is $${currentBalance.toFixed(2)}. You've spent $${totalExpense} so far this month.` });
        }

        // 3. Debt Patterns
        if (q.includes('debt') || q.includes('owe') || q.includes('loan')) {
            const totalDebt = debts.reduce((acc, d) => acc + d.remainingAmount, 0);
            if (totalDebt === 0) return res.json({ answer: "You have zero debt! You're actually doing something right. 👏" });
            return res.json({ answer: `You owe a total of $${totalDebt}. Your biggest liability is ${debts.sort((a, b) => b.remainingAmount - a.remainingAmount)[0].name}. Stop borrowing money.` });
        }

        // 4. Specific Category Spending
        if (q.includes('spent on') || q.includes('how much for')) {
            let category = q.split('spent on ')[1] || q.split('for ')[1];
            if (category) {
                category = category.replace('?', '').trim();
                const total = transactions
                    .filter(t => t.category.toLowerCase().includes(category))
                    .reduce((acc, t) => acc + t.amount, 0);
                return res.json({ answer: `You've dropped $${total} on ${category} recently. ${total > 100 ? "Is it really worth it?" : "Not bad."}` });
            }
        }

        // Typo handling & funny responses
        const funnyResponses = [
            "I only speak 'Rich'. Try again when you have more money.",
            "That's a great question. Unfortunately, my advice is as empty as your wallet.",
            "Processing... Error: Spending habits too chaotic to analyze.",
            "Maybe ask me if you can afford that coffee instead of deep life questions?",
            "You spent $50 on 'Misc' yesterday. Want to explain that first?"
        ];

        res.json({ answer: funnyResponses[Math.floor(Math.random() * funnyResponses.length)] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ answer: "I just had a mental breakdown. Try again." });
    }
});

module.exports = router;
