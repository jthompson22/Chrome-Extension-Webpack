const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


module.exports = {
    entry: {
        login: path.resolve('src/login/LoginAction.tsx'),
        options: path.resolve('src/options/options.tsx'),
        background: path.resolve('src/background/background.ts'),
        contentScript: path.resolve('src/contentScript/contentScript.ts'),
        AppWrapper: path.resolve('src/components/AppWrapper.tsx')
    },
    module: {
        rules: [
            {
                use: 'ts-loader',
                test: /\.tsx?$/,
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                          importLoaders: 1,
                        },
                    },
              ],
            },
            {
                type: 'assets/resource',
                test: /\.(png|jpg|jpeg|gif|woff|woff2|tff|eot|svg)$/,
            },
        ]
    },
    "plugins": [
        // new Dotenv({
        //     path: `.env${env.file ? `.${env.file}` : ''}`
        //   }),
        // new DefineEnvsPlugin(
        //     [
        //         'API_ROOT',
        //         'CLIENT_ROOT',
        //         'SIGN_UP',
        //         'LOGIN'
        //     ],
        //     'GLOBAL'
        // ),
        new CleanWebpackPlugin({
            cleanStaleWebpackAssets: false
        }),
        new CopyPlugin({
            patterns: [{
                from: path.resolve('src/static'),
                to: path.resolve('dist')
            }]
        }),
        ...getHtmlPlugins([
            'options',
            'login'
        ])
    ],
    resolve: {
        extensions: ['.tsx', '.js', '.ts']
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist')
    },
    optimization: {
        // splitChunks: {
        //     chunks: 'all',
        // }
        runtimeChunk: false
    }
    
}

function getHtmlPlugins(chunks){
    return chunks.map(chunk => new HtmlPlugin({
        title: 'React Extension',
        filename: `${chunk}.html`,
        chunks: [chunk]
    }))
}