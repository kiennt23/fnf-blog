import path from 'path';
import { fileURLToPath } from "url";
import webpack from 'webpack';
import { defineReactCompilerLoaderOption, reactCompilerLoader } from 'react-compiler-webpack';
import TerserPlugin from "terser-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

import semver from 'semver';
import { execSync } from 'child_process';
import {WebpackManifestPlugin} from "webpack-manifest-plugin";

/** Generate a fallback version like "0.1.0-rcabc" using the current time in base 36 */
function getFallbackVersion(prefix = '0.1.0-rc') {
    // For instance, turn 1695991234567 into something like "khg9u3" (base 36).
    const shortTime = Date.now().toString(36);
    return `${prefix}-${shortTime}`;
}

function getVersionFromGit() {
    try {
        let latestTag = 'v0.0.0'; // fallback if no tags exist
        let headTag = null;       // will hold the tag if HEAD matches a tag

        try {
            // 1) Get the "latest tag" (closest, annotated or lightweight)
            //    This returns something like "v1.2.3" or "1.2.3".
            latestTag = execSync('git describe --tags --abbrev=0').toString().trim();
        } catch {
            // If this fails (no tags in repo), fallback stays "v0.0.0"
        }

        try {
            // 2) Check if HEAD exactly matches a tag:
            //    If HEAD is on a tagged commit, this returns the tag name.
            headTag = execSync('git describe --tags --exact-match HEAD')
                .toString()
                .trim();
        } catch {
            // If it fails, HEAD is not on that tag
        }

        if (headTag) {
            // If HEAD is exactly on the latest tag, use that tag as-is
            return headTag.replace(/^v/, ''); // remove leading 'v' if present
        } else {
            // Otherwise, we:
            //   a) Parse the latestTag as semver
            //   b) Increase the "feature" (minor) version
            //   c) Append the commit hash as a suffix

            const cleanTag = latestTag.replace(/^v/, '');
            // safely parse
            const parsed = semver.parse(cleanTag) || semver.parse('0.0.0');
            // bump the minor version (the "feature" number)
            const nextVersion = semver.inc(parsed, 'minor');

            // Get short commit hash (e.g., "abc123")
            const commitHash = execSync('git rev-parse --short HEAD')
                .toString()
                .trim();

            // Combine them into something like: "1.3.0-abc123"
            return getFallbackVersion(`${nextVersion}-${commitHash}`);
        }
    } catch (e) {
        return getFallbackVersion();
    }
}

const versionString = getVersionFromGit();
const isProduction = process.env.NODE_ENV === 'production';
const plugins = [
    new webpack.DefinePlugin({
        SERVICE_WORKER_VERSION: JSON.stringify(versionString),
    }),
];

const entry = {
    'client': ['./frontend/client.tsx'],
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseConf = {
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: '[name].[contenthash].js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.[tj]sx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                loader: reactCompilerLoader,
                options: defineReactCompilerLoaderOption({})
            },
            {
                test: /\.css$/, // optional if using CSS
                use: [MiniCssExtractPlugin.loader, 'style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    }
};

let finalConfig = {}
if (isProduction) {
    const prodEntry = {
        ...entry,
        'service-worker': ['./web-worker/service-worker.ts'],
    }

    finalConfig = {
        ...baseConf,
        output: {
            path: path.resolve(__dirname, 'public'),
            filename: (pathData) => {
                return pathData.chunk.name === 'service-worker' ? '[name].js' : '[name].[contenthash].js';
            },
            publicPath: '/'
        },
        entry: prodEntry,
        mode: 'production',
        devtool: false,
        optimization: {
            minimize: true,
            minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
            runtimeChunk: 'single',
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                },
            }
        },
        plugins: [
            ...plugins,
            new MiniCssExtractPlugin(),
            new WebpackManifestPlugin({}),
        ]
    }
} else {
    const devEntry = {}
    const entries = Object.keys(entry);
    entries.forEach(theEntry => {
        devEntry[theEntry] = ['webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000', ...entry[theEntry]];
    })

    finalConfig = {
        ...baseConf,
        output: {
            path: path.resolve(__dirname, 'public'),
            filename: '[name].bundle.js',
            publicPath: '/'
        },
        entry: devEntry,
        mode: 'development',
        devtool: 'inline-source-map',
        devServer: {
            hot: true,
            compress: true,
            port: 8080,
            static: {
                directory: path.resolve(__dirname, 'public'),
            },
            devMiddleware: {
                serverSideRender: true,
                publicPath: path.resolve(__dirname, 'public'),
                writeToDisk: true,
            },
            client: {
                overlay: false,
                progress: true,
                reconnect: 3,
                webSocketTransport: 'ws'
            },
            webSocketServer: 'ws'
        },
        plugins: [
            ...plugins,
            new webpack.HotModuleReplacementPlugin(),
            new ReactRefreshWebpackPlugin({
                overlay: {
                    sockIntegration: 'whm',
                },
            })
        ]
    }
}

export default finalConfig;
