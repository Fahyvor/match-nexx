import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { bearer } from "@elysiajs/bearer";
import { staticPlugin } from "@elysiajs/static";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// Routes
import authRoutes from "./routes/auth";
import jobRoutes from "./routes/jobs";
import applicantRoutes from "./routes/applicants";
import recruiterRoutes from "./routes/recruiters";

const PORT = Number(process.env.PORT || 3000);
const isProd = process.env.NODE_ENV === "production";

console.log("environment", process.env.NODE_ENV);

console.log(`Booting server (${isProd ? "production" : "development"})`);

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
  // const distPath = path.join(process.cwd(), "dist");
  const distPath ="../dist";
  console.log("Serving frontend from:", distPath);

  console.log("Serving frontend from:", distPath);

  app.use(
    staticPlugin({
      assets: distPath,
      prefix: "/",
    })
  );

  // React Router SPA fallback
  app.get("*", async () => {
    const file = Bun.file(path.join(distPath, "index.html"));

    if (!(await file.exists())) {
      return new Response("Frontend build not found", {
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

console.log(`API running on http://localhost:${PORT}`);
console.log(`Swagger: http://localhost:${PORT}/swagger`);

if (!isProd) {
  console.log("Frontend (Vite): http://localhost:5173");
}

export { app };