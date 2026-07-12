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
// const isProd = false;

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

  // Only fallback for client-side routes
  app.get("/*", ({ request }) => {
    const pathname = new URL(request.url).pathname;

    // Don't rewrite API or asset requests
    if (
      pathname.startsWith("/api") ||
      pathname.startsWith("/assets") ||
      pathname.includes(".")
    ) {
      return new Response("Not Found", { status: 404 });
    }

    return Bun.file(path.join(publicPath, "index.html"));
  });
}

const publicPath = path.join(process.cwd(), "public");

console.log("cwd =", process.cwd());
console.log("public =", publicPath);

console.log(
  "index exists =",
  await Bun.file(path.join(publicPath, "index.html")).exists()
);

console.log(
  "js exists =",
  await Bun.file(path.join(publicPath, "assets", "index-BQrNP1Fq.js")).exists()
);

app.get("/debug-index", () => {
  return Bun.file(path.join(publicPath, "index.html"));
});

app.get("/debug-js", () => {
  return Bun.file(path.join(publicPath, "assets", "index-BQrNP1Fq.js"));
});
app.listen(PORT);

console.log(`API running on ${PORT}`);

console.log(`Swagger: http://localhost:${PORT}/swagger`);

if (!isProd) {
  console.log("Frontend (Vite): http://localhost:5173");
}

export { app };