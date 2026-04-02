import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function serveStatic(app: Express) {
  // Get the absolute path to the public directory
  // This works both in development and when bundled
  const publicDir = path.join(process.cwd(), "dist", "public");
  
  if (!fs.existsSync(publicDir)) {
    throw new Error(
      `Could not find the build directory: ${publicDir}, make sure to build the client first`,
    );
  }

  app.use(express.static(publicDir));

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}
