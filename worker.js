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

    if (x.verbose) {
      process.send({ time: true })
    }

    if (generatedAddress === x.address) {
      const [seconds, nanos] = process.hrtime(x.totalStartTime)
      const timeTaken = (seconds + Math.round(nanos / 1000000 / 1000 / 1000))

      console.log(`Seed found in ${timeTaken}s`)
      console.log(seedPhrase)
      process.send({ end: true })
    }
  }
})
