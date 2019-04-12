const arkjs = require('arkjs')
const { randomMnemonicSeed } = require('bip39-seeder')
const axios = require('axios')

randomMnemonicSeed(null, async seed => {
  const keys = ark.crypto.getKeys(seed)
  const address = arkjs.crypto.getAddress(keys.publicKey)
  let balance = 0

  const res = await axios({
    method: 'GET',
    url: 'https://explorer.ark.io/api/v2/wallets/' + address
  }).then(res => {
    balance = res.data.data.balance / 100000000
  }).catch(err => {
    if (err.response.status === 404) {
      balance = 0
    }
  })

  console.log('address: ', address)
  console.log('seed:    ', seed)
  console.log('balance: ', balance)
})

