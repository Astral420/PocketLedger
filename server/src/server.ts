import "dotenv/config";
import { app } from "./app";
import runMigrations from "./db/migrate";

async function startServer() {
  try {
    if (process.env.NODE_ENV !== "test") {
      process.stderr.write("Running database migrations...\n");
      await runMigrations();
    } else {
      process.stderr.write("Skipping migrations in test environment\n");
    }

    const PORT = Number(process.env.PORT ?? 3000);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error: any) {
    process.stderr.write(`Failed to start server: ${error?.message}\n`);
    process.exit(1);
  }
}

startServer();