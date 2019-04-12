const bitcoin = require('bitcoinjs-lib')
const axios = require('axios')
const jsonpAdapter = require('axios-jsonp');

const guess = async () => {
  const keyPair = bitcoin.ECPair.makeRandom()
  const address = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey }).address
  const secret = keyPair.toWIF()

  const res = await axios({
    method: 'GET',
    url: 'https://blockchain.info/rawaddr/' + address,
    adapter: jsonpAdapter,
  })

  const balance = res.data.final_balance

  console.log('address: ', address)
  console.log('secret:  ', secret)
  console.log('balance: ', balance)
}

guess()
