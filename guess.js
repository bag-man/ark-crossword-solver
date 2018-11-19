const { fork } = require('child_process')
const os = require('os')
const bip39 = require('./bip39-words')

// goose program loyal raw receive leisure potato lonely ill riot federal cabbage
const address = 'APvT4CZ31tMPEByUZ8rTBut2HYFynFvWbr'
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

const words = crossword.map((word) => { return findPossibilities(word) })
const longest = words.reduce((p, c, i, a) => a[p].length > c.length ? p : i, 0)
const chunkSize = Math.floor(words[longest].length / cpus)
let lastChunk = 0

console.log('Total Search Space: ', findNumPossibilities(words))

for (let i = 0; i < cpus; i++) {
  const workerWords = words.slice()

  if (i === cpus - 1) {
    workerWords[longest] = workerWords[longest].slice(lastChunk)
  } else {
    workerWords[longest] = workerWords[longest].slice(lastChunk, lastChunk + chunkSize)
  }
  lastChunk = lastChunk + chunkSize

  console.log('Worker', i, 'search space: ', findNumPossibilities(workerWords))
  workers.push(fork('./worker'))
  workers[i].send({ address, workerWords })
}

for (let i = 0; i < workers.length; i++) {
  workers[i].on('message', (x) => {
    for (let j = 0; j < workers.length; j++) {
      workers[j].kill('SIGKILL')
    }
  })
}
