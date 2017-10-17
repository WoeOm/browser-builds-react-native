# ethereumjs browser builds

This repository contains browser builds of certain ethereumjs libraries.  They are built using browserify with a known set of working dependencies.

## Usage

In your web application, include only one of the builds form the `dist` directory. All exports will be available under the global `EthJS`.

You should be import they first:

https://github.com/WoeOm/react-native-secure-randombytes
https://github.com/WoeOm/react-native-safe-crypto

```js
import { asyncRandomBytes } from 'react-native-secure-randombytes'
import safeCrypto from 'react-native-safe-crypto'

window.randomBytes = asyncRandomBytes
window.scryptsy = safeCrypto.scrypt
```

demo:
```js
let code = await EthJs.Mnemonic.randomPhrase()

const derivePath = `m/44'/60'/0'/0/0`
let seedBuffer = EthJs.Mnemonic.phraseToSeed(code)

const key = EthJs.WalletHD.fromMasterSeed(seedBuffer);

const wallet = key.derivePath(derivePath).getWallet();

-------------------------

const wallet = await EthJs.Wallet.generate()
```

**Note:** all packages expect ECMAScript 6 (ES6) as a minimum environment. From browsers lacking ES6 support, please use a shim (like [es6-shim](https://github.com/paulmillr/es6-shim)) before including any of the builds from this repo.

## Build

Run `webpack` to generate a new set up builds. Change `package.json` to require different versions of the libraries.

