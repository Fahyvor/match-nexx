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
// const isProd = process.env.NODE_ENV === "production";
const isProd = false;

console.log("environment", process.env.NODE_ENV);

console.log(`Booting server (${isProd ? "production" : "development"})`);

const app = new Elysia()
  .use(swagger())
  .use(bearer())

  .group("/api", app =>
    app
      .get("/health", () => ({
        status: "online",
        message: "Server is healthy",
        version: "1.0.0"
      }))
      .use(authRoutes)
      .use(jobRoutes)
      .use(applicantRoutes)
      .use(recruiterRoutes)
  );

if (isProd) {
  const publicPath = path.join(process.cwd(), "public");

  app.use(
    staticPlugin({
      assets: publicPath,
      prefix: "/",
    })
  );

  app.get("*", () => {
    return Bun.file(path.join(publicPath, "index.html"));
  });
}

app.listen(PORT);

console.log(`API running on ${PORT}`);

console.log(`Swagger: http://localhost:${PORT}/swagger`);

if (!isProd) {
  console.log("Frontend (Vite): http://localhost:5173");
}

export { app };