import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import semver from 'semver';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Git-based versioning (same as your webpack config) ---
function getFallbackVersion(prefix = '0.1.0-rc') {
    // For example, "0.1.0-rc-abc123"
    const shortTime = Date.now().toString(36);
    return `${prefix}-${shortTime}`;
}

function getVersionFromGit() {
    try {
        let latestTag = 'v0.0.0'; // fallback if no tags exist
        let headTag: string | null = null;
        try {
            // Get the latest tag (annotated or lightweight)
            latestTag = execSync('git describe --tags --abbrev=0').toString().trim();
        } catch {}
        try {
            // If HEAD exactly matches a tag
            headTag = execSync('git describe --tags --exact-match HEAD').toString().trim();
        } catch {}
        if (headTag) {
            // Use the tag (without a leading "v")
            return headTag.replace(/^v/, '');
        } else {
            const cleanTag = latestTag.replace(/^v/, '');
            const parsed = semver.parse(cleanTag) || semver.parse('0.0.0');
            const nextVersion = parsed?.inc('minor');
            const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
            return getFallbackVersion(`${nextVersion}-${commitHash}`);
        }
    } catch (e) {
        return getFallbackVersion();
    }
}

const versionString = getVersionFromGit();

// --- Vite configuration ---
export default defineConfig(({ command }) => {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        base: '/', // equivalent to webpack's publicPath
        plugins: [
            // Vite’s React plugin (includes Fast Refresh in dev)
            react({
                babel: {
                    plugins: [
                        ["babel-plugin-react-compiler"]
                    ]
                }
            }),
        ],
        // Define global constants (replaces webpack.DefinePlugin)
        define: {
            SERVICE_WORKER_VERSION: JSON.stringify(versionString),
        },
        build: {
            // Output to the "public" folder (as in your webpack config)
            outDir: path.resolve(__dirname, 'public'),
            target: 'esnext',
            sourcemap: !isProduction, // inline source maps in dev
            manifest: 'manifest.json',
            // Use Terser for minification in production (Vite defaults to esbuild otherwise)
            minify: isProduction ? 'terser' : false,
            rollupOptions: isProduction
                ? {
                    // In production we have two entry points: one for the client and one for the service worker
                    input: {
                        client: path.resolve(__dirname, 'frontend/client.tsx'),
                        'service-worker': path.resolve(__dirname, 'web-worker/service-worker.ts'),
                    },
                    output: {
                        // For the service worker we output a plain filename, for others we use a hash
                        entryFileNames: (chunk) => {
                            if (chunk.name === 'service-worker') {
                                return '[name].js';
                            }
                            return '[name].[hash].js';
                        },
                    },
                }
                : undefined,
        },
        resolve: {
            // Vite automatically resolves these extensions, but you can list them explicitly if desired.
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
    };
});
