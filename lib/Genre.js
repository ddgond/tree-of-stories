import {randomItem} from "./utilities.js";

// TODO: generate state machine for each genre to prevent romantic tropes to follow a rejection prompt

const adventure = {
  promptTypes: [
    'Normal',
    'Safe',
    'Risky',
    'Funny',
    'Dramatic'
  ],
  tropes: [
    'a new mystery',
    'a new villain',
    'a new ally',
    'a tense fight scene',
    'a secret passage'
  ]
}

const horror = {
  promptTypes: [
    'Normal',
    'Panicked',
    'Calm',
    'Cautious',
    'Brave'
  ],
  tropes: [
    'a frightening event',
    'a tense situation',
    'an ominous message',
    'a secret revealed',
    'a new mystery'
  ]
}

const romance = {
  promptTypes: [
    'Normal',
    'Flirty',
    'Rejection',
    'Funny',
    'Dramatic'
  ],
  tropes: [
    'an intimate moment',
    'a romantic gesture',
    'a misunderstanding',
    'a flirty invitation',
    'a fun event'
  ]
}

const comedy = {
  promptTypes: [
    'Normal',
    'Funny',
    'Dramatic',
    'Absurd',
    'Silly'
  ],
  tropes: [
    'an unexpected joke',
    'subverted expectations',
    'someone making a fool of themselves',
    'a funny misunderstanding',
    'a silly event'
  ]
}

const drama = {
  promptTypes: [
    'Normal',
    'Risky',
    'Dramatic',
    'Safe',
    'Crazy'
  ],
  tropes: [
    'a tense situation',
    'a misunderstanding',
    'a secret revealed',
    'a dramatic encounter',
    'a new mystery'
  ]
}

const cyoa = {
  promptTypes: [
    'Normal',
    'Safe',
    'Risky',
    'Funny',
    'Dramatic'
  ],
  tropes: [
    'a new mystery',
    'a clue',
    'a new ally',
    'a tense fight scene',
    'a secret passage',
    'a new villain',
    'a frightening event',
    'a tense situation',
    'an ominous message',
    'subverted expectations',
    'a fun event',
  ]
}

function tropeFromGenre(genre) {
  switch (genre) {
    case 'adventure':
      return randomItem(adventure.tropes);
    case 'horror':
      return randomItem(horror.tropes);
    case 'romance':
      return randomItem(romance.tropes);
    case 'comedy':
      return randomItem(comedy.tropes);
    case 'drama':
      return randomItem(drama.tropes);
    case 'cyoa':
      return randomItem(cyoa.tropes);
    default:
      return randomItem(cyoa.tropes);
  }
}

function promptTypesFromGenre(genre) {
  switch (genre) {
    case 'adventure':
      return adventure.promptTypes;
    case 'horror':
      return horror.promptTypes;
    case 'romance':
      return romance.promptTypes;
    case 'comedy':
      return comedy.promptTypes;
    case 'drama':
      return drama.promptTypes;
    case 'cyoa':
      return cyoa.promptTypes;
    default:
      return cyoa.promptTypes;
  }
}

export default {
  promptTypesFromGenre,
  tropeFromGenre
}