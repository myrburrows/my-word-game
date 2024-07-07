import { MYWORD5 } from './myword5.js';
import { MYWORD6 } from './myword6.js';
import { MYWORD7 } from './myword7.js';
import { COMMONWORDS } from './commonwords.js';

const wordBanks = {
    5: MYWORD5,
    6: MYWORD6,
    7: MYWORD7
};

const starterWords = {
    5: 'trail',
    6: 'serial',
    7: 'citadel'
};

let word;
let wordLength;
let attempts;
let eligibleWords;
const maxAttempts = 4;

function startGame() {
    word = COMMONWORDS[Math.floor(Math.random() * COMMONWORDS.length)];
    wordLength = word.length;
    console.log(`Secret word: ${word}`);
    attempts = 0;
    eligibleWords = wordBanks[wordLength] ? wordBanks[wordLength].slice() : [];

    document.getElementById('guess-input').value = starterWords[wordLength] || '';
    document.getElementById('feedback').innerHTML = '';
    document.getElementById('eligible-words').innerHTML = eligibleWords.join(', ');
    document.getElementById('score-history').style.display = 'none';

    const feedbackDiv = document.getElementById('feedback');
    feedbackDiv.innerHTML = '';

    for (let i = 0; i < maxAttempts; i++) {
        const attemptRow = document.createElement('div');
        attemptRow.className = 'attempt-row';
        for (let j = 0; j < wordLength; j++) {
            const box = document.createElement('div');
            box.className = 'letter-box';
            attemptRow.appendChild(box);
        }
        feedbackDiv.appendChild(attemptRow);
    }

    updateScore(0);
}

function updateScore(incorrectTries) {
    document.getElementById('user-score').textContent = `Incorrect Tries: ${incorrectTries}`;
}

function handleGuessSubmission() {
    const guessInput = document.getElementById('guess-input');
    const guess = guessInput.value.toLowerCase();
    if (guess.length !== wordLength) {
        alert(`Please enter a ${wordLength}-letter word.`);
        return;
    }

    const feedbackDiv = document.getElementById('feedback');
    const attemptRow = feedbackDiv.children[attempts];
    for (let i = 0; i < wordLength; i++) {
        const box = attemptRow.children[i];
        box.textContent = guess[i];
        if (guess[i] === word[i]) {
            box.className = 'letter-box correct';
        } else if (word.includes(guess[i])) {
            box.className = 'letter-box present';
        } else {
            box.className = 'letter-box absent';
        }
    }

    attempts++;
    if (guess === word) {
        alert('Congratulations! You guessed the word!');
        updateScore(attempts - 1);
        saveScore(attempts - 1);
    } else if (attempts === maxAttempts) {
        alert(`Game over! The correct word was: ${word}`);
        updateScore(attempts);
        saveScore(attempts);
    } else {
        updateScore(attempts);
        updateEligibleWords(guess);
    }

    guessInput.value = '';  // Clear the input field after processing the guess
}

function updateEligibleWords(guess) {
    eligibleWords = eligibleWords.filter(word => isWordEligible(word, guess));
    document.getElementById('eligible-words').innerHTML = eligibleWords.join(', ');
}

function isWordEligible(candidate, guess) {
    if (candidate.length !== guess.length) {
        return false;
    }

    // Track letters that must be excluded completely
    const mustExclude = new Array(26).fill(0); // Track count of gray letters in guess

    // Count occurrences of each letter in the word to handle over-counts
    const wordLetterCounts = new Array(26).fill(0);
    for (let char of word) {
        wordLetterCounts[char.charCodeAt(0) - 'a'.charCodeAt(0)]++;
    }

    // Determine letters to exclude and setup for other checks
    for (let i = 0; i < guess.length; i++) {
        const guessCharIndex = guess[i].charCodeAt(0) - 'a'.charCodeAt(0);
        if (word.indexOf(guess[i]) === -1) { // Gray check
            mustExclude[guessCharIndex]++;
        }
    }

    // Check candidate against guess for green and yellow, and enforce grays
    for (let i = 0; i < guess.length; i++) {
        const candidateIndex = candidate[i].charCodeAt(0) - 'a'.charCodeAt(0);
        const guessIndex = guess[i].charCodeAt(0) - 'a'.charCodeAt(0);

        if (guess[i] === word[i]) { // Green check
            if (candidate[i] !== guess[i]) return false;
        } else if (word.includes(guess[i])) { // Yellow check
            if (candidate[i] === guess[i] || !candidate.includes(guess[i])) return false;
        }

        // Enforce gray letters: candidate must not include any letter marked as gray
        if (mustExclude[guessIndex] > 0 && candidate.includes(guess[i]) && !word.includes(guess[i])) {
            return false;
        }
    }

    return true;
}

function saveScore(incorrectTries) {
    const history = JSON.parse(localStorage.getItem('scoreHistory')) || [];
    history.push({ word, incorrectTries });
    localStorage.setItem('scoreHistory', JSON.stringify(history));
}

function viewHistory() {
    const history = JSON.parse(localStorage.getItem('scoreHistory')) || [];
    const historyDiv = document.getElementById('score-history');
    historyDiv.style.display = 'block';
    historyDiv.innerHTML = history.map(entry => `Word: ${entry.word}, Incorrect Tries: ${entry.incorrectTries}`).join('<br>');
}

function clearHistory() {
    localStorage.removeItem('scoreHistory');
    document.getElementById('score-history').innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submit-guess');
    const guessInput = document.getElementById('guess-input');
    const restartButton = document.getElementById('restart-game');
    const viewHistoryButton = document.getElementById('view-history');
    const clearHistoryButton = document.getElementById('clear-history');

    if (submitButton && guessInput && restartButton && viewHistoryButton && clearHistoryButton) {
        submitButton.addEventListener('click', handleGuessSubmission);
        guessInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                handleGuessSubmission();
            }
        });
        restartButton.addEventListener('click', startGame);
        viewHistoryButton.addEventListener('click', viewHistory);
        clearHistoryButton.addEventListener('click', clearHistory);
        startGame();  // Initialize the game after setting up listeners
    } else {
        console.error('Missing elements:', {
            submitButton,
            guessInput,
            restartButton,
            viewHistoryButton,
            clearHistoryButton
        });
    }
});
