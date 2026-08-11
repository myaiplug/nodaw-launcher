/**
 * build-subapps.mjs
 * Pre-build script to prepare sub-apps for bundling into NoDAW installer.
 *
 * Builds available sub-apps, copies their unpacked output into bundled-apps/,
 * and fails the parent build if any present sub-app fails to install/build.
 */

import { execSync } from 'child_process';
import { mkdirSync, existsSync, rmSync, copyFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const bundledDir = join(rootDir, 'bundled-apps');

const SUBAPPS = {
  TrimIt: {
    sourceDir: join(rootDir, 'TrimIt'),
    installCmd: 'npm ci',
    buildCmd: 'npm run electron:build -- --win --x64 --publish never',
    outputDir: 'dist_electron/win-unpacked',
    exeName: 'TrimIt.exe'
  },
  IconGenius: {
    sourceDir: join(rootDir, 'IconGenius'),
    // Temporary compatibility workaround until IconGenius aligns plugin-react with Vite 8.
    installCmd: 'npm ci --legacy-peer-deps',
    buildCmd: 'npm run electron:build -- --win --x64 --publish never',
    outputDir: 'dist_electron/win-unpacked',
    exeName: 'Icon Genius.exe'
  },
  ScrewAI: {
    sourceDir: join(rootDir, 'ScrewAI'),
    installCmd: 'npm ci',
    buildCmd: 'npm run electron:build -- --win --x64 --publish never',
    outputDir: 'dist_electron/win-unpacked',
    exeName: 'ScrewAI.exe'
  },
  StemSplit: {
    sourceDir: join(rootDir, 'StemSplit'),
    buildCmd: 'npm run tauri build',
    outputDir: 'src-tauri/target/release',
    exeName: 'StemSplit.exe',
    extraDirs: ['embedded_python']
  }
};

function runCommand(cmd, cwd) {
  console.log(`\n📦 Running: ${cmd}`);
  console.log(`   In: ${cwd}\n`);
  try {
    execSync(cmd, { cwd, stdio: 'inherit', shell: true });
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${error.message}`);
    return false;
  }
}

function copyDir(src, dest) {
  if (!existsSync(src)) {
    console.warn(`⚠️ Source not found: ${src}`);
    return false;
  }

  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
      count++;
    }
  }

  if (count > 0) console.log(`   Copied ${count} files to ${dest}`);
  return true;
}

async function buildSubApps() {
  console.log('\n🚀 NoDAW Sub-App Build Script');
  console.log('='.repeat(50));

  if (existsSync(bundledDir)) {
    console.log('\n🧹 Cleaning previous bundled-apps...');
    rmSync(bundledDir, { recursive: true, force: true });
  }
  mkdirSync(bundledDir, { recursive: true });

  const results = {};

  for (const [name, config] of Object.entries(SUBAPPS)) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📱 Processing: ${name}`);
    console.log('─'.repeat(50));

    const destDir = join(bundledDir, name);
    mkdirSync(destDir, { recursive: true });

    if (!existsSync(config.sourceDir)) {
      console.warn(`⚠️ Source directory not found: ${config.sourceDir}`);
      console.log(`   Skipping ${name} (not in workspace)`);
      results[name] = { status: 'skipped', reason: 'Source not found' };
      continue;
    }

    const builtExePath = join(config.sourceDir, config.outputDir, config.exeName);
    const alreadyBuilt = existsSync(builtExePath);

    if (alreadyBuilt) {
      console.log(`✅ ${name} already built, copying...`);
    } else {
      console.log(`🔨 Building ${name}...`);

      if (existsSync(join(config.sourceDir, 'package.json')) && config.installCmd) {
        const installSuccess = runCommand(config.installCmd, config.sourceDir);
        if (!installSuccess) {
          console.error(`❌ Failed to install dependencies for ${name}`);
          results[name] = { status: 'failed', reason: 'Dependency installation failed' };
          continue;
        }
      }

      const buildSuccess = runCommand(config.buildCmd, config.sourceDir);
      if (!buildSuccess) {
        console.error(`❌ Failed to build ${name}`);
        results[name] = { status: 'failed', reason: 'Build failed' };
        continue;
      }
    }

    const outputPath = join(config.sourceDir, config.outputDir);
    if (existsSync(outputPath)) {
      console.log(`📦 Copying ${name} to bundled-apps...`);
      copyDir(outputPath, destDir);
      results[name] = { status: 'success' };
    } else {
      console.warn(`⚠️ Build output not found: ${outputPath}`);
      results[name] = { status: 'failed', reason: 'Output not found' };
    }

    if (config.extraDirs) {
      for (const extraDir of config.extraDirs) {
        const extraSrc = join(config.sourceDir, extraDir);
        const extraDest = join(destDir, extraDir);
        if (existsSync(extraSrc)) {
          console.log(`📦 Copying ${extraDir}...`);
          copyDir(extraSrc, extraDest);
        }
      }
    }
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log('📊 Build Summary:');
  console.log('═'.repeat(50));

  for (const [name, result] of Object.entries(results)) {
    const icon = result.status === 'success' ? '✅' : result.status === 'skipped' ? '⏭️' : '❌';
    const msg = result.reason ? ` (${result.reason})` : '';
    console.log(`   ${icon} ${name}: ${result.status}${msg}`);
  }

  const failures = Object.entries(results).filter(([, result]) => result.status === 'failed');
  if (failures.length > 0) {
    throw new Error(`Sub-app build failed: ${failures.map(([name]) => name).join(', ')}`);
  }

  console.log('\n✨ Sub-app bundling complete!');
  console.log(`   Output: ${bundledDir}\n`);
}

buildSubApps().catch(error => {
  console.error(`\n❌ ${error.message}`);
  process.exitCode = 1;
});
