module.exports = {
  entry: "./src/main.js",
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  resolve: {
    extensions: [".js"],
  },
  output: {
    path: path.resolve(__dirname, ".webpack", "main"),
    filename: "index.js",
  },
  target: "electron-main",
};
