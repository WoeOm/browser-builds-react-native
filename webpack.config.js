module.exports = {
    entry: {
        wallet: __dirname + "/src/wallet.js",
        all: __dirname + "/src/all.js",
        tx: __dirname + "/src/tx.js",
        icap: __dirname + "/src/icap.js",
        tx: __dirname + "/src/tx.js",
        vm: __dirname + "/src/vm.js",
        wallet: __dirname + "/src/wallet.js",
        "wallet-hd": __dirname + "/src/wallet-hd.js",
        "wallet-thirdparty": __dirname + "/src/wallet-thirdparty.js",
    },
    output: {
        path: __dirname + "/public",
        filename: "ethereumjs-[name].js"
    },
    module: {
        loaders: [
          {
            test: /\.json$/,
            loader: "json-loader"
          },
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
          }
        ]
      }
}