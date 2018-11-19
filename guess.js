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

const rotate = (array, times) => {
  while (times--) {
    var temp = array.shift()
    array.push(temp)
  }
}

const findPossibilities = (word) => {
  let possibilities = []
  bip39.forEach((possibleWord) => {
    if (possibleWord.match(new RegExp('^' + word + '$'))) {
      possibilities.push(possibleWord)
    }
  })

  return possibilities
}

const words = crossword.map((word) => { return findPossibilities(word) })
const longest = words.reduce((p, c, i, a) => a[p].length > c.length ? p : i, 0)

for (let i = 0; i < cpus; i++) {
  const workerWords = words.slice()

  if (i === cpus - 1) {
    workerWords[longest] = workerWords[longest].slice(i)
  } else {
    workerWords[longest] = new Array(workerWords[longest][i])
  }

  workerWords.map(word => {
    const shift = Math.ceil((word.length / cpus) * (i+1))
    return rotate(word, shift)
  })

  workers.push(fork('./worker'))
  workers[i].send({ address, workerWords })
}


for (let i = 0; i < workers.length; i++) {
  workers[i].on('message', (x) => {
    for (let j = 0; j < workers.length; j++) {
      workers[i].kill()
    }
    process.exit()
  })
}
