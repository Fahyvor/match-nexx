import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { bearer } from "@elysiajs/bearer";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

import authRoutes from "./routes/auth";
import jobRoutes from "./routes/jobs";
import applicantRoutes from "./routes/applicants";
import recruiterRoutes from "./routes/recruiters";

const PORT = Number(process.env.PORT || 3000);
const isProd = process.env.NODE_ENV === "production";
const publicPath = path.join(process.cwd(), "public");

console.log(`Booting server (${isProd ? "production" : "development"})`);

const app = new Elysia()
  .use(swagger())
  .use(bearer())
  .group("/api", app =>
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
  app
    .get("/assets/*", ({ request }) => {
      const pathname = new URL(request.url).pathname;
      return Bun.file(path.join(publicPath, pathname));
    })
    .get("/", () => Bun.file(path.join(publicPath, "index.html")))
    .get("/*", ({ request }) => {
      const pathname = new URL(request.url).pathname;
      if (pathname.startsWith("/api") || pathname.includes(".")) {
        return new Response("Not Found", { status: 404 });
      }
      return Bun.file(path.join(publicPath, "index.html"));
    });
}

app.listen(PORT);

console.log(`API running on http://localhost:${PORT}`);
console.log(`Swagger: http://localhost:${PORT}/swagger`);
if (!isProd) {
  console.log(`Frontend (Vite): http://localhost:5173`);
}

export { app };

// Working Prod

// import { Elysia } from "elysia";
// import { swagger } from "@elysiajs/swagger";
// import { bearer } from "@elysiajs/bearer";
// import dotenv from "dotenv";
// import path from "path";

// dotenv.config();

// import authRoutes from "./routes/auth";
// import jobRoutes from "./routes/jobs";
// import applicantRoutes from "./routes/applicants";
// import recruiterRoutes from "./routes/recruiters";

// const PORT = Number(process.env.PORT || 3000);
// const publicPath = path.join(process.cwd(), "public");

// const app = new Elysia()
//   .use(swagger())
//   .use(bearer())
//   .group("/api", app =>
//     app
//       .get("/health", () => ({
//         status: "online",
//         message: "Server is healthy",
//         version: "1.0.0",
//       }))
//       .use(authRoutes)
//       .use(jobRoutes)
//       .use(applicantRoutes)
//       .use(recruiterRoutes)
//   )
//   // Serve any file under /assets/*
//   .get("/assets/*", ({ request }) => {
//     const pathname = new URL(request.url).pathname;
//     return Bun.file(path.join(publicPath, pathname));
//   })
//   // Root and client-side routes
//   .get("/", () => Bun.file(path.join(publicPath, "index.html")))
//   .get("/*", ({ request }) => {
//     const pathname = new URL(request.url).pathname;
//     if (pathname.startsWith("/api") || pathname.includes(".")) {
//       return new Response("Not Found", { status: 404 });
//     }
//     return Bun.file(path.join(publicPath, "index.html"));
//   })
//   .listen(PORT);

// console.log(`Server running on http://localhost:${PORT}`);
// console.log(`Swagger: http://localhost:${PORT}/swagger`);

// import { Elysia } from "elysia";
// import { swagger } from "@elysiajs/swagger";
// import { bearer } from "@elysiajs/bearer";
// import { staticPlugin } from "@elysiajs/static";
// import dotenv from "dotenv";
// import path from "path";

// dotenv.config();

// // Routes
// import authRoutes from "./routes/auth";
// import jobRoutes from "./routes/jobs";
// import applicantRoutes from "./routes/applicants";
// import recruiterRoutes from "./routes/recruiters";

// const PORT = Number(process.env.PORT || 3000);
// // const isProd = process.env.NODE_ENV === "production";
// const isProd = false;

// console.log("environment", process.env.NODE_ENV);

// console.log(`Booting server (${isProd ? "production" : "development"})`);

// const app = new Elysia()
//   .use(swagger())
//   .use(bearer())

//   .group("/api", app =>
//     app
//       .get("/health", () => ({
//         status: "online",
//         message: "Server is healthy",
//         version: "1.0.0"
//       }))
//       .use(authRoutes)
//       .use(jobRoutes)
//       .use(applicantRoutes)
//       .use(recruiterRoutes)
//   );

// if (isProd) {
//   const publicPath = path.join(process.cwd(), "public");

//   app.use(
//     staticPlugin({
//       assets: publicPath,
//       prefix: "/",
//     })
//   );

//   // Only fallback for client-side routes
//   app.get("/*", ({ request }) => {
//     const pathname = new URL(request.url).pathname;

//     // Don't rewrite API or asset requests
//     if (
//       pathname.startsWith("/api") ||
//       pathname.startsWith("/assets") ||
//       pathname.includes(".")
//     ) {
//       return new Response("Not Found", { status: 404 });
//     }

//     return Bun.file(path.join(publicPath, "index.html"));
//   });
// }

// const publicPath = path.join(process.cwd(), "public");

// console.log("cwd =", process.cwd());
// console.log("public =", publicPath);

// console.log(
//   "index exists =",
//   await Bun.file(path.join(publicPath, "index.html")).exists()
// );

// console.log(
//   "js exists =",
//   await Bun.file(path.join(publicPath, "assets", "index-BQrNP1Fq.js")).exists()
// );

// app.get("/debug-index", () => {
//   return Bun.file(path.join(publicPath, "index.html"));
// });

// app.get("/debug-js", () => {
//   return Bun.file(path.join(publicPath, "assets", "index-BQrNP1Fq.js"));
// });

// app.get("/check", async () => {
//   return {
//     cwd: process.cwd(),
//     publicPath,
//     indexExists: await Bun.file(path.join(publicPath, "index.html")).exists(),
//     assetExists: await Bun.file(
//       path.join(publicPath, "assets", "index-BQrNP1Fq.js")
//     ).exists(),
//   };
// });

// app.get("/asset-test", () => {
//   return Bun.file(path.join(publicPath, "assets", "index-BQrNP1Fq.js"));
// });

// app.listen(PORT);

// console.log(`API running on ${PORT}`);

// console.log(`Swagger: http://localhost:${PORT}/swagger`);

// if (!isProd) {
//   console.log("Frontend (Vite): http://localhost:5173");
// }

// export { app };