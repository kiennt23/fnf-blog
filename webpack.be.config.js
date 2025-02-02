const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'development', // or "production"
    entry: './backend/index.tsx',
    target: 'node',          // Important for backend code
    externals: [nodeExternals()],  // So we don't bundle node_modules
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'backend.bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.[tj]sx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    }
};
