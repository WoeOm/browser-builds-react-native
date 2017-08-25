global.EthJs = {
  ABI: require('ethereumjs-abi'),
  Account: require('ethereumjs-account'),
  Block: require('ethereumjs-block'),
  Buffer: require('buffer'),
  BN: require('ethereumjs-util').BN,
  ICAP: require('ethereumjs-icap'),
  RLP: require('ethereumjs-util').rlp,
  Trie: require('merkle-patricia-tree'),
  Tx: require('ethereumjs-tx'),
  Units: require('ethereumjs-units'),
  Util: require('ethereumjs-util'),
  VM: require('ethereumjs-vm'),
  Wallet: require('ethereumjs-wallet-react-native'),
  WalletHD: require('ethereumjs-wallet-react-native/hdkey'),
  WalletThirdparty: require('ethereumjs-wallet-react-native/thirdparty')
}
