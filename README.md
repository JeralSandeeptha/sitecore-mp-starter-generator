# Sitecore framework workspace

This `CLI` works as a sitecore marketplace application generator. This wrap the main sitecore marketplace starter repo and on top of that this is adding addtional configurations based on user preferences.

## `scx` — Marketplace app scaffolder

The CLI lives in [`scx-cli/`](./scx-cli/). Full documentation: [`scx-cli/README.md`](./scx-cli/README.md).

### Quick start (Windows)

1. Build the CLI (once, or after pulling changes):

   ```powershell
   cd scx-cli
   npm install
   npm run build
   ```

2. Run it **without** `npm link` or global `PATH` tweaks:

   ```powershell
   cd ..
   .\scx.cmd --help
   .\scx.cmd create my-app -y --skip-install
   ```

3. To type **`scx`** from any folder: add this directory to your user **PATH** (e.g. `C:\Projects\Sitecore\framework`). Windows resolves `scx` to `scx.cmd`.

### Quick start (macOS / Linux / Git Bash)

```bash
cd scx-cli && npm install && npm run build && cd ..
chmod +x scx
./scx --help
```

Add the `framework` directory to `PATH` if you want to run `scx` by name.
