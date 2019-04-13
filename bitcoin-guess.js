const bitcoin = require('bitcoinjs-lib')

const guess = () => {
  const keyPair = bitcoin.ECPair.makeRandom()
  const address = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey }).address
  const secret = keyPair.toWIF()

  return { address, secret }
}

module.exports = { guess }
