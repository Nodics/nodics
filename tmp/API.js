
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var path = require('path');
var webpack = require('webpack');

const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJS = require("uglify-js");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const entryPathObj = {
    "home": './src/home',
    "signup": './src/signup',
    "pdp": './src/pdp',
    "plp": './src/plp',
    "search": './src/search',
    "cart": './src/cart',
    "profile": './src/profile',
    "compare": './src/compare',
    "checkout": './src/checkout',
    "thankyou": './src/thankyou',
    "payment": './src/payment',
    "error": './src/error',
    "static": './src/static',
    "storelogin": './src/storelogin',
    "storelocator": './src/storelocator'
}

const entryHtmlPlugins = Object.keys(entryPathObj).map(function (key) {
    return new HtmlWebpackPlugin({
        template: `./html/${key}.html`,
        chunks: [key],
        filename: `html/${key}.html`,
        cache: true,
        hash: true
    })
});

module.exports = {
    // This is the "main" file which should include all other modules
    entry: entryPathObj,
    // Where should the compiled file go?
    output: {
        // To the `dist` folder
        // With the filename `build.js` so it's dist/build.js
        path: path.join(__dirname, 'hybrisdist'),
        filename: 'js/[name].build.js',
        publicPath: '../'
    },
    devtool: 'source-map',
    module: {
        // Special compilation rules
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/
            },
            {
                test: /\.vue$/,
                loader: 'vue'
            },
            {
                test: /\.less$/,
                loader: 'vue'
            },
            {
                test: /\.css$/,
                loader: 'vue'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            { test: /\.jpg$/, loader: "file-loader" },
            { test: /\.png$/, loader: "url-loader?mimetype=image/png" }
        ]
    },
    vue: {
        loaders: {
            js: 'babel',
            exclude: /node_modules/,
            css: ExtractTextPlugin.extract("css"),
            less: ExtractTextPlugin.extract('css!less')
        }
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.common.js'
        }
    },
    plugins: [
        new ExtractTextPlugin("css/[name].build.css"),
        new OptimizeCssAssetsPlugin(),
        new CopyWebpackPlugin([
            { from: './static', to: 'static' },
            { from: './vendor/font-awesome-4.7.0/fonts', to: 'fonts' },
            { from: './vendor/bootstrap/fonts', to: 'fonts' },
            { from: './vendor/roboto/fonts', to: 'fonts' },
            { from: './vendor', to: 'vendor' },
            { from: './config', to: 'config' },
            { from: './index.html', to: 'index.html' }

        ]),
        new webpack.DefinePlugin({
            'serverPath': JSON.stringify("")
        }),
        new MergeIntoSingleFilePlugin({
            files: {
                "css/lib.bundle.css": ['./vendor/bootstrap/css/bootstrap.min.css',
                    './vendor/bootstrap-datepicker/css/datepicker.css',
                    './vendor/font-awesome-4.7.0/css/font-awesome.min.css',
                    './vendor/slick/slick.css',
                    './vendor/roboto/roboto.css',
                    './vendor/toastr/toastr.min.css',
                    './vendor/animate.css/animate.min.css'
                ],
                "js/lib.bundle.js": ['./vendor/jquery/jquery-3.2.1.min.js',
                    './vendor/bootstrap/js/bootstrap.min.js',
                    './vendor/bootstrap-datepicker/js/bootstrap-datepicker.js',
                    './vendor/slick/slick.min.js',
                    './vendor/easyzoom/easyzoom.js',
                    './vendor/toastr/toastr.min.js'
                ]
            },
            transform: {
                'js/lib.bundle.js': code => UglifyJS.minify(code).code
            }
        })

        , new UglifyJsPlugin({
            test: /\.js($|\?)/i,
            sourceMap: true
        })
    ].concat(entryHtmlPlugins)
}