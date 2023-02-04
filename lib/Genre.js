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
    'a secret passage',
    'a clue',
    'a daring escape',
    'an unexpected twist',
    'a heroic sacrifice',
    'a hidden truth',
    'an unexpected reunion',
    'a climactic battle',
    'a battle of wits',
    'a puzzle',
    'a thrilling chase',
    'a daring plan',
    'an unlikely hero'
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
    'a new mystery',
    'an unexplained phenomenon',
    'an eerie atmosphere',
    'an unexpected twist',
    'a jump scare',
    'an unknown entity',
    'a supernatural force',
    'a long-forgotten past',
    'an unidentifiable sound',
    'an impending doom',
    'a dark secret'
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
    'a fun event',
    'sharing a secret',
    'a near-miss',
    'a fateful parting',
    'a forbidden love',
    'a tearful goodbye',
    'a roller coaster of emotions',
    'mixed feelings',
    'a love triangle',
    'a difficult choice',
    'self-discovery',
    'a heartbreaking betrayal',
    'an unexpected reunion',
    'an uncertain future'
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
    'a silly event',
    'a physical comedy gag',
    'a clever one-liner',
    'a wacky character',
    'a witty exchange of dialogue',
    'a situation gone awry',
    'a hilarious observation',
    'a farcical situation',
    'a running gag',
    'an absurd scenario',
    'an ironic situation',
    'a meta joke',
    'an over-the-top reaction',
    'an unexpected reveal',
    'a slapstick moment',
    'a character making a bad decision',
    'a tongue-in-cheek reference',
    'a parody of a famous scene'
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
    'a new mystery',
    'a life-changing decision',
    'a tragic event',
    'a heroic sacrifice',
    'an unexpected twist',
    'a powerful discovery',
    'a heart-wrenching goodbye',
    'a moment of redemption',
    'a moment of clarity',
    'a moment of despair',
    'a moment of triumph',
    'a moment of regret',
    'a moment of hope',
    'a moment of fear',
    'an unlikely friendship',
    'a battle of wits',
    'an unlikely victory',
    'an emotional reunion',
    'a battle of wills',
    'a last-minute rescue',
    'an unexpected reunion',
    'a race against time',
    'a showdown',
    'a moral dilemma',
    'a redemption arc',
    'a power struggle',
    'a forbidden love',
    'a quest for justice',
    'a moment of truth',
    'a forbidden friendship'
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
    'a daring escape',
    'a surprise twist',
    'a unique challenge',
    'a hidden location',
    'a magical artifact',
    'a powerful enemy',
    'a mysterious figure',
    'a dangerous journey',
    'a moral dilemma',
    'a crucial decision',
    'a strange occurrence',
    'a life-changing decision',
    'a mysterious creature',
    'a character making a bad decision',
    'a race against time',
    'a forbidden love',
    'a quest for justice',
    'a battle of wits',
    'a battle of wills',
    'a witty exchange of dialogue',
    'a misunderstanding',
    'self-discovery',
    'an uncertain future',
    'a betrayal',
    'an ominous message',
    'a jump scare',
    'an unexplained phenomenon',
    'a puzzle',
    'a thrilling chase',
    'a daring plan',
    'a heroic sacrifice',
    'an unlikely hero',
    'a last-minute rescue'
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