import path from "node:path";
import { fileURLToPath } from "node:url";
import { createMDX } from "fumadocs-mdx/next";

const appDirectory = path.dirname(fileURLToPath(import.meta.url));

const config = {
  output: "standalone",
  outputFileTracingRoot: path.join(appDirectory, "../.."),
  transpilePackages: ["@th1n/toast"],
};

export default createMDX()(config);
