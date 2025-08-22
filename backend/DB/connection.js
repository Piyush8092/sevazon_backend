const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || `mongodb+srv://arijchowdhury:Arij1234@cluster0.ypvv5cp.mongodb.net/save?retryWrites=true&w=majority&appName=ecommerce`, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('MongoDB connected');
    } catch (e) {
        console.error('MongoDB connection error:', e.message);
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

module.exports = connectDB;
