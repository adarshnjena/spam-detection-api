import { build, type OnResolveResult } from "bun";
import { join } from "path";
import fs from "fs";

async function runBuild() {
  console.log("Starting build process...");

  const distPath = join(import.meta.dir, "dist");

  try {
    // Check if dist exists and handle accordingly
    if (fs.existsSync(distPath)) {
      const stats = fs.statSync(distPath);
      if (stats.isFile()) {
        fs.unlinkSync(distPath);
        console.log("Removed existing dist file");
      } else if (stats.isDirectory()) {
        fs.rmSync(distPath, { recursive: true, force: true });
        console.log("Removed existing dist directory");
      }
    }

    // Create dist directory
    fs.mkdirSync(distPath);
    console.log("Created new dist directory");

    // Build the application
    const result = await build({
      entrypoints: ["./src/index.ts"],
      outdir: "./dist",
      target: "bun",
      minify: true,
      splitting: true,
      external: [
        "hono",
        "@hono/zod-validator",
        "drizzle-orm",
        "bcrypt",
        "jsonwebtoken",
        "@neondatabase/serverless",
        "zod",
        "dotenv",
        "dotenv/config"
      ],
      plugins: [
        {
          name: "external-modules",
          setup(build) {
            build.onResolve({ filter: /^[^./]|^\.[^./]|^\.\.[^/]/ }, (): OnResolveResult => {
              return { path: '', external: true };
            });
          },
        },
      ],
    });

    if (!result.success) {
      console.error("Build failed:", result.logs);
      process.exit(1);
    }

    console.log("Build completed successfully");

    // Copy necessary files
    await Bun.write(
      join(distPath, "package.json"),
      await Bun.file("package.json").text()
    );
    console.log("Copied package.json to dist");

    // Copy .env file (make sure to gitignore this in production!)
    if (fs.existsSync(".env")) {
      await Bun.write(
        join(distPath, ".env"),
        await Bun.file(".env").text()
      );
      console.log("Copied .env to dist");
    } else {
      console.log("No .env file found, skipping copy");
    }

    // Generate a simple start script
    await Bun.write(
      join(distPath, "start.js"),
      'require("dotenv").config();\nrequire("bun").serve(require("./index.js"));'
    );
    console.log("Generated start script");

    console.log("Build process completed");
  } catch (error) {
    console.error("An error occurred during the build process:", error);
    process.exit(1);
  }
}

runBuild();