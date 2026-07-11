const { merge } = require('webpack-merge');
const common = require('./webpack.common.cjs');
const path = require('path');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist'),
        },
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        },
        historyApiFallback: true,
        port: process.env.PORT || 3000,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:5000',
                changeOrigin: true,
            },
        },
        open: true,
    },
});
