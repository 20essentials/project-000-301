import { WORDS } from './arrayWords.js';

const $ = el => document?.querySelector(el);
const $$ = el => document?.querySelectorAll(el);
const $input = $('input');
const $time = $('time');
const $p = $('p');
const $modal = $('.modal');

const INITIAL_TIME = 30;
const N_WORDS = 45;
let currentTime = INITIAL_TIME;
let setIntervalId = null;
let words = [];

function counterTime() {
  $time.textContent = currentTime;
  setIntervalId = setInterval(() => {
    currentTime--;
    $time.textContent = currentTime;
    if (currentTime === 0) {
      const correctLetter = $p.querySelectorAll('letter.correct').length;
      const incorrectLetter = $p.querySelectorAll('letter.incorrect').length;
      const nChars = correctLetter + incorrectLetter;
      const accuracy = nChars > 0 ? (correctLetter / nChars) * 100 : 0;
      const correctWords = [...$p.querySelectorAll('word')]
        .map(word =>
          [...word.querySelectorAll('letter')].some(l =>
            l.classList.contains('correct')
          )
        )
        .filter(boolean => boolean === true).length;
      clearInterval(setIntervalId);
      console.log(correctLetter / nChars);
      $('.wpm').innerHTML = (correctWords * 60) / INITIAL_TIME;
      $('.accuracy').innerHTML = Math.trunc(accuracy) + '%';
      $('.n-words').innerHTML = correctWords;
      $('.n-chars').innerHTML = nChars;
      $modal.showModal();
    }
  }, 1000);
}

function introduceText() {
  words = WORDS.toSorted(() => Math.random() - 0.5).slice(0, N_WORDS);

  let paraghaphText = words
    .map(word => {
      const lettersOfcurrenWord = word.split('');
      return `<word>${lettersOfcurrenWord
        .map(letra => `<letter>${letra}</letter>`)
        .join('')}</word>`;
    })
    .join(' ');

  $p.innerHTML = paraghaphText;
}

function firstActiveWordAndLetter() {
  const $firstWord = $('word');
  const $firstLetter = $firstWord?.querySelector('letter');
  $firstWord.classList.add('wordActive');
  $firstLetter.classList.add('letterActive');
}

function initGame() {
  counterTime();
  introduceText();
  firstActiveWordAndLetter();
}

function initEvents() {
  document.addEventListener('keydown', _ => {
    $input.focus();
  });
  $p.addEventListener('click', _ => {
    $input.focus();
  });
  $input.addEventListener('keydown', handleKeyDown);
  $input.addEventListener('keyup', handleKeyUp);

  function handleKeyDown(e) {
    const { key } = e;
    let wordActive = $('.wordActive');
    if (!wordActive) return;
    let letterActive =
      wordActive?.querySelector('.letterActiveRight') ||
      wordActive?.querySelector('.letterActive');
    if (!letterActive) return;

    if (key === ' ' || key === 'Tab' || key === 'Enter') {
      e.preventDefault();
      let letterJumped = [
        ...wordActive?.querySelectorAll('letter:not(.correct):not(.incorrect)')
      ];

      if (letterJumped?.length > 0) {
        letterJumped.forEach(letter => {
          letter.className = '';
          letter.classList.add('incorrect');
        });
      }

      wordActive.classList.remove('wordActive');
      letterActive.classList.remove('letterActive', 'letterActiveRight');
      const nextWord = wordActive?.nextElementSibling;

      if (nextWord) {
        const firstLetterOfNextWord = nextWord?.querySelector('letter');
        nextWord.classList.add('wordActive');
        firstLetterOfNextWord.classList.add('letterActive');
        $input.value = '';
      }
    }

    if (key === 'Backspace') {
      const letterActive =
        wordActive?.querySelector('.letterActiveRight') ||
        wordActive?.querySelector('.letterActive');

      let thereAreTypoErors = $$('letter.incorrect').length > 0;
      if (!thereAreTypoErors) {
        e.preventDefault();
        return;
      }

      let previousLetter = letterActive?.previousElementSibling;

      if (previousLetter) {
        letterActive.className = '';
        previousLetter.classList = '';

        let firsLetterOfWordActive =
          wordActive.firstElementChild === previousLetter;

        if (firsLetterOfWordActive) {
          previousLetter.classList.add('letterActive');
        }

        if (!previousLetter?.classList?.contains('letterActive')) {
          previousLetter.classList.add('letterActive');
        }
      } else if (!previousLetter) {
        const prevWordActive = wordActive?.previousElementSibling;

        if (prevWordActive) {
          let letterActive =
            wordActive?.querySelector('.letterActiveRight') ||
            wordActive?.querySelector('.letterActive');
          letterActive.classList.remove('letterActive', 'letterActiveRight');
          wordActive.classList.remove('wordActive');
          prevWordActive.classList.add('wordActive');
          prevWordActive.lastElementChild.className = '';
          let letras = [...prevWordActive.querySelectorAll('letter')]
            .map(l => l.textContent)
            .join('');
          prevWordActive.lastElementChild.classList.add('letterActiveRight');
          $input.value = letras;
        }
      }
    }
  }

  function handleKeyUp(e) {
    const { key } = e;
    const wordActive = $('.wordActive');
    if (!wordActive) return;
    $input.maxLength = wordActive.children.length;

    let allLettersOfWordActive = wordActive.querySelectorAll('letter');

    e.target.value.split('').forEach((char, index) => {
      let currentLetterActive = allLettersOfWordActive[index];
      let currentLetterActiveText = currentLetterActive.textContent.trim();

      let addClass = currentLetterActiveText === char ? 'correct' : 'incorrect';
      currentLetterActive.classList.add(addClass);
      currentLetterActive.classList.remove('letterActive');

      let nextLetter = currentLetterActive?.nextElementSibling;

      let lastLetter = allLettersOfWordActive.length === index + 1;

      if (nextLetter && !lastLetter) {
        nextLetter.classList.add('letterActive');
      } else {
        currentLetterActive.classList.add('letterActiveRight');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initGame();
  initEvents();
});

document.addEventListener('click', e => {
  if (e.target.matches('.play-again')) {
    location.reload();
  }
});
