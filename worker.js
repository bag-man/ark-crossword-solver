const arkjs = require('arkjs')

function* cartesian(head, ...tail) {
  let remainder = tail.length ? cartesian(...tail) : [[]]
  for (let r of remainder) for (let h of head) yield [h, ...r]
}

process.on('message', (x) => {
  const cartesianFn = cartesian(...x.workerWords)

  for(fn of cartesianFn) {
    const seedPhrase = fn.join(' ')
    const generatedAddress = arkjs.crypto.getAddress(arkjs.crypto.getKeys(seedPhrase).publicKey)
    if (generatedAddress === x.address) {
      console.log('Seed found: ' + seedPhrase)
      process.exit()
    }
  }
  process.exit()
})
