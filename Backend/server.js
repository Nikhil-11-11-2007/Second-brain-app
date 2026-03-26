import app from "./src/app.js";
import "dotenv/config"
import connectDB from "./src/config/database.js";
import "./src/queue/worker.js"

const PORT = process.env.PORT || 8000;

connectDB()

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});