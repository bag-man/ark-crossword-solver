const { fork } = require('child_process')
const os = require('os')
const bip39 = require('./bip39-words')
const exec = require('child_process').exec


// Set the address of the wallet
const address = 'APvT4CZ31tMPEByUZ8rTBut2HYFynFvWbr'
// goose program loyal raw receive leisure potato lonely ill riot federal cabbage

// Set the missing values of the passphrase
const crossword =
  [ 'g...e'
  , 'p.....m'
  , 'l...l'
  , 'r.w'
  , 'r.....e'
  , 'l.....e'
  , 'p....o'
  , 'l....y'
  , 'i.l'
  , 'r..t'
  , 'f.....l'
  , 'c.....e'
  ]

// Set to true for performance and progress metrics. Depends on `sensors` being installed.
const verbose = true

// Set to true to shuffle word lists for use on multiple machines
const shuffle = true

const workers = []
const cpus = os.cpus().length

const findPossibilities = (word) => {
  let possibilities = []
  bip39.forEach((possibleWord) => {
    if (possibleWord.match(new RegExp('^' + word + '$'))) {
      possibilities.push(possibleWord)
    }
  })

  return possibilities
}

const findNumPossibilities = (words) => {
  const counts = words.map(word => word.length)
  return counts.reduce((a, v) => a * v)
}

const shuffleWords = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    let temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

const words = crossword.map((word) => { return findPossibilities(word) })
const longest = words.reduce((p, c, i, a) => a[p].length > c.length ? p : i, 0)
const chunkSize = Math.floor(words[longest].length / cpus)
let lastChunk = 0
let remainder = words[longest].length - (chunkSize * 8)

const totalSearchSpace = findNumPossibilities(words)
console.log(`Total search space: ${totalSearchSpace}`)

const totalStartTime = process.hrtime()
let startTime = process.hrtime()

for (let i = 0; i < cpus; i++) {
  const workerWords = words.slice()

  workerWords[longest] = workerWords[longest].slice(lastChunk, lastChunk + chunkSize)
  lastChunk = lastChunk + chunkSize

  if (remainder) {
    workerWords[longest].push(words[longest].pop())
    remainder--
  }

  if (shuffle) {
    for (let y = 0; y < workerWords.length; y++) {
      shuffleWords(workerWords[y])
    }
  }

  workers.push(fork('./worker'))
  workers[i].send({ address, workerWords, verbose, totalStartTime })
}

let counter = 0

for (let i = 0; i < workers.length; i++) {
  workers[i].on('message', (x) => {
    if (x.end) {
      for (let j = 0; j < workers.length; j++) {
        workers[j].kill('SIGKILL')
      }
    }

    if (x.time) {
      counter++
      if ((counter % 1000) === 0) {
        temp = exec(`sensors | grep Physical | awk '{printf "%s+",$4}'`, (err, tempC, stderr) => {
          const [seconds, nanos] = process.hrtime(startTime)
          const speed = 1000 / (seconds + Math.round(nanos / 1000000) / 1000)
          const cpuFreq = os.cpus().reduce((r, c) => r + c.speed, 0) / cpus
          const percentage = Math.round((counter / totalSearchSpace) * 100)
          console.log(`${counter}/${totalSearchSpace} (${percentage}%) ... ${Math.round(speed)}/s ... ${Math.round(cpuFreq)} Mhz ... ${tempC}`)
          startTime = process.hrtime()
        })
      }
    }
  })
}
