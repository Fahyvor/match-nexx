import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { bearer } from "@elysiajs/bearer";
import { staticPlugin } from "@elysiajs/static";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

import authRoutes from "./routes/auth";
import jobRoutes from "./routes/jobs";
import applicantRoutes from "./routes/applicants";
import recruiterRoutes from "./routes/recruiters";

const PORT = Number(process.env.PORT || 3000);
const isProd = process.env.NODE_ENV === "production";

const app = new Elysia()
  .use(swagger())
  .use(bearer())

  .group("/api", (app) =>
    app
      .get("/health", () => ({
        status: "online",
        message: "Server is healthy",
        version: "1.0.0",
      }))
      .use(authRoutes)
      .use(jobRoutes)
      .use(applicantRoutes)
      .use(recruiterRoutes)
  );

if (isProd) {
  app.use(
    staticPlugin({
      assets: path.join(process.cwd(), "dist"),
      prefix: "/",
    })
  );

  app.get("*", async () => {
    const file = Bun.file(path.join(process.cwd(), "dist", "index.html"));

    if (!(await file.exists())) {
      return new Response("Frontend not found", {
        status: 404,
      });
    }

    return new Response(file, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  });
}

app.listen(PORT);

console.log(`Server running on port ${PORT}`);
console.log(`Swagger: http://localhost:${PORT}/swagger`);

export default app;