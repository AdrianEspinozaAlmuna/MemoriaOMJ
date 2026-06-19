import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: [
      "unitarias/iteracion-1/**/*.test.js",
      "unitarias/iteracion-2/**/*.test.js",
      "unitarias/iteracion-3/**/*.test.js",
      "unitarias/iteracion-4/**/*.test.js",
      "unitarias/iteracion-5/**/*.test.js",
      "unitarias/iteracion-6/**/*.test.js",
    ],
    fileParallelism: false,
  },
});
