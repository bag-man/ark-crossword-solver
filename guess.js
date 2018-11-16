const { fork } = require('child_process')
const os = require('os')
const bip39 = require('./bip39-words')

const crossword =
  [ 's..k'
  , 'p..o.it.'
  , '.umb'
  , 'w.i.e'
  , 'mod.fy'
  , '.ask'
  , 's.a.t'
  , '.os.u.t.'
  , 'n.ck'
  , '.eck'
  , 'spre.d'
  , 's.ng'
  ]

const words = crossword.map((word) => { return findPossibilities(word) })

const address = 'AN3mtTEfk1qreRbbKup18x1CuxmHhx1P1T'
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

