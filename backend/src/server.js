const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const app = require('./app');
const connectDB = require('./config/db');
const { registerEventHandlers } = require('./events/handlers');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    registerEventHandlers();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

if (require.main === module && !process.env.VERCEL) {
  start();
}

module.exports = app;
