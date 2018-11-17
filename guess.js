const { fork } = require('child_process')
const os = require('os')
const bip39 = require('./bip39-words')

const crossword =
  [ 'anchor'
  , 'c.b.n'
  , '......'
  , 'fault'
  , '......'
  , '..d..'
  , 'drill'
  , 'output'
  , 'sail'
  , 'age'
  , 'movie'
  , '.*'
  ]

const words = crossword.map((word) => { return findPossibilities(word) })

const address = 'ATUt3sr3FkE2Q6cmDRH7s2sv9Nv9ySHLUK'
const workers = []
const cpus = os.cpus().length;

const rotate = (array, times) => {
  while (times--) {
    var temp = array.shift()
    array.push(temp)
  }
}

const longest = words.reduce((p, c, i, a) => a[p].length > c.length ? p : i, 0)

for (let i = 0; i < cpus; i++) {
  const workerWords = words.slice()

  if (i === cpus - 1) {
    workerWords[longest] = workerWords[longest].slice(i)
  } else {
    workerWords[longest] = new Array(workerWords[longest][i])
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
