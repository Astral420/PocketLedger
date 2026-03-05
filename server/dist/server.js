"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const migrate_1 = __importDefault(require("./db/migrate"));
async function startServer() {
    try {
        if (process.env.NODE_ENV !== "test") {
            process.stderr.write("Running database migrations...\n");
            await (0, migrate_1.default)();
        }
        else {
            process.stderr.write("Skipping migrations in test environment\n");
        }
        const PORT = Number(process.env.PORT ?? 3000);
        app_1.app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        process.stderr.write(`Failed to start server: ${error?.message}\n`);
        process.exit(1);
    }
}
startServer();
