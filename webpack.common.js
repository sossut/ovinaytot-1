const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const WebpackPwaManifest = require("webpack-pwa-manifest");

module.exports = {
  entry: {
    app: "./src/index.js",
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: "assets/",
          to: "assets/",
          context: "src/",
        },
      ],
    }),
    new HtmlWebpackPlugin({
      title: "Ovinäyttö",
      meta: {
        viewport: "width=device-width, initial-scale=1.0",
      },
      template: "./src/index.html",
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),

    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    }),

    new WebpackPwaManifest({
      name: "Ovinäyttö",
      id: "/",
      publicPath: "/",
      short_name: "oviPWA",
      filename: "manifest.json",
      description: "Ovinaytto PWA",
      theme_color: "#F5F5F5",
      background_color: "#F5F5F5",
      icons: [
        {
          src: path.resolve("src/assets/img/icon.png"),
          sizes: [96, 128, 192, 256, 384, 512],
          type: "image/png",
          purpose: "any",
        },
        {
          src: path.resolve("src/assets/img/maskable_icon.png"),
          size: "400x400",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    }),

    new ESLintPlugin({}),
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        type: "asset/resource",
      },
    ],
  },
};
