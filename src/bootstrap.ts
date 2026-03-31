import "dotenv/config"; 

import { app } from "./app";
import { config } from "./config/env";
import { connectDB } from "./config/db";

connectDB().then(() => {
  app.listen(config.PORT, () => {
    console.log(`🚀 Server running on port ${config.PORT}`);
  });
});