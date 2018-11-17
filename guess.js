const { fork } = require('child_process')
const os = require('os')
const bip39 = require('./bip39-words')

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

const words = crossword.map((word) => { return findPossibilities(word) })

const address = 'APvT4CZ31tMPEByUZ8rTBut2HYFynFvWbr'
const workers = []
const cpus = os.cpus().length;

const rotate = (array, times) => {
  while (times--) {
    var temp = array.shift()
    array.push(temp)
  }
}

for (let i = 0; i < cpus; i++) {
  const workerWords = words.slice()

  // assumes words[0].length > cpus
  if (i === cpus - 1) {
    workerWords[0] = workerWords[0].slice(i)
  } else {
    workerWords[0] = new Array(workerWords[0][i])
  }

  workerWords.map(word => rotate(word, i))
  workers.push(fork('./worker'))
  workers[i].send({ address, workerWords })
}

function findPossibilities (word) {
  let possibilities = []
  bip39.forEach((possibleWord) => {
    if (possibleWord.match(new RegExp('^' + word + '$'))) {
      possibilities.push(possibleWord)
    }
  })

  return possibilities
}

for (let i = 0; i < workers.length; i++) {
  workers[i].on('message', (x) => {
    for (let j = 0; j < workers.length; j++) {
      workers[i].kill()
    }
    process.exit()
  })
}
