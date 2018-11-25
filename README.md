# ark-crossword-solver
Inspired by [this crossword challenge](https://www.reddit.com/r/ArkEcosystem/comments/9xcnj1/1st_ark_word_search_35_ark_reward_available/), I developed a program that would solve such a crossword using multiple CPU cores in the most efficient way possible.

If you want to run it, edit the guess.js file with your crossword, replacing unknown letter with `.`'s and replacing unkown words with `.*`.

Currently it shuffles the various permutations given to so that there is some advantage to running this in parallel on multiple machines, not just cores. Although the more cores on one machine the better. 

If there is interest I may make this into a program to help recover missing words in the passphrases. 
