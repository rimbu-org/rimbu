import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ["./src/main/index.mts", "./src/menu/index.mts"],
  sourcemap: true,
  clean: true,
  dts: true,
  legacyOutput: false,
  format: ["esm", "cjs"]
})
