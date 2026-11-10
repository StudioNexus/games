name: Nexus Arcade OS - Gemini CLI Compilation Workflow

on:
  push:
    branches: [ "main", "development" ]
  pull_request:
    branches: [ "main" ]
  workflow_dispatch:

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest

    permissions:
      contents: write

    steps:
      - name: Checkout Source Repository Tree
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Initialize Node.js Operational Environment
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: '**/package-lock.json'

      - name: Set Up Python Environment
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Configure Execution Dependencies
        run: |
          if [ -f package-lock.json ]; then
            npm ci
          elif [ -f package.json ]; then
            npm install
          else
            echo "No package.json tracking manifest configured. Initializing workspace..."
            npm init -y
          fi
          
          # Install TypeScript and CSS bundling tooling if not present
          npm install -g typescript esbuild postcss-cli cssnano
          
          if [ -f requirements.txt ]; then
            pip install -r requirements.txt
          fi

      - name: Compile TypeScript & Minify CSS Assets
        run: |
          # 1. Compile TypeScript (if tsconfig.json or TS files exist)
          if [ -f tsconfig.json ]; then
            echo "Compiling TypeScript via tsconfig..."
            npx tsc
          elif [ -d src ]; then
            echo "Transpiling TS files in src..."
            npx tsc src/*.ts --outDir dist/ || true
          fi

          # 2. Bundle & Minify CSS Assets
          if [ -d styles ] || [ -d css ]; then
            echo "Minifying CSS assets..."
            npx esbuild styles/*.css css/*.css --minify --outdir=dist/css/ --allow-overwrite || true
          fi

      - name: Execute Automated Nexus Build Compilation Engine (Node.js)
        run: |
          if [ -f scripts/build-nexus.js ] || [ -f scripts/build_nexus.js ]; then
            node scripts/build-nexus.js || node scripts/build_nexus.js
          fi

      - name: Execute Python Build Engine
        run: |
          if [ -f scripts/build-nexus.py ] || [ -f scripts/build_nexus.py ]; then
            python scripts/build-nexus.py || python scripts/build_nexus.py
          fi

      - name: Execute PowerShell Build Engine
        shell: pwsh
        run: |
          if (Test-Path "scripts/build_nexus.ps1") {
            & ./scripts/build_nexus.ps1
          } elseif (Test-Path "scripts/build-nexus.ps1") {
            & ./scripts/build-nexus.ps1
          }

      - name: Verify Distribution Asset Blueprint Generation
        run: |
          if [ ! -f dist/gemini-terminal.min.html ]; then
            echo "❌ Critical Build Defect: Production asset compilation file missing from workspace output target!"
            exit 1
          fi
          echo "✅ Compilation output target verified."

      - name: Commit Transpiled Core Assets and Admin Changes
        if: github.event_name == 'push'
        run: |
          git config --global user.name "Nexus Core Automation"
          git config --global user.email "nexus-bot@users.noreply.github.com"
          
          git add dist/ modules/admin.html || true
          
          if git diff --staged --quiet; then
            echo "No automated structural updates or asset mutations encountered. Workspace cleanly balanced."
          else
            git commit -m "chore(ci): auto-compile Gemini CLI & synchronize Matrix admin telemetry configurations [skip ci]"
            git push origin ${{ github.ref_name }}
          fi
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
