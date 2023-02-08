import Logger from "./Logger";

class Statistic {
  constructor (name, initialValue) {
    this.name = name;
    this._value = initialValue;
    this._initialValue = initialValue;
    this._resetTime = Date.now();
  }

  reset () {
    this._value = this._initialValue;
    this._resetTime = Date.now();
  }

  get () {
    return this._value;
  }

  set (value) {
    this._value = value;
  }

  toString () {
    return `${this.name}: ${this._value}`;
  }
}

class IncrementStatistic extends Statistic {
  constructor (name) {
    super(name, 0);
  }

  set(value) {
    throw new Error('IncrementStatistic.set() is not implemented');
  }

  increment () {
    this._value += 1;
  }

  add (amount) {
    this._value += amount;
  }
}

class GroupStatistic extends Statistic {
  constructor (name, statisticType) {
    super(name, {});
    this._statisticType = statisticType;
  }

  addEntry (itemName) {
    if (!this._value[itemName]) {
      this._value[itemName] = new this._statisticType(itemName);
    }
  }

  removeEntry (itemName) {
    delete this._value[itemName];
  }

  get(itemName) {
    if (!this._value[itemName]) {
      this._value[itemName] = new this._statisticType(itemName);
    }
    return this._value[itemName];
  }

  set(itemName) {
    throw new Error('GroupStatistic.set() is not implemented');
  }

  forEach (callback) {
    for (const statistic of Object.values(this._value)) {
      callback(statistic);
    }
  }

  toString () {
    let lines = [];
    this.forEach(statistic => {
      lines.push(statistic.toString());
    });
    return `===START ${this.name}===\n${lines.join('\n')}\n===END ${this.name}===`;
  }
}

class DerivedStatistic extends Statistic {
  constructor (name, getFn) {
    super(name, null);
    this._getFn = getFn;
  }

  get () {
    return this._getFn();
  }

  set () {
    throw new Error('DerivedStatistic.set() is not implemented');
  }

  toString() {
    return `${this.name}: ${this.get()}`
  }
}

const OPEN_AI_COST_PER_TOKEN = 0.00002; // $0.02 per 1000 tokens on Davinci-03

const Statistics = {
  openAiRequests: new IncrementStatistic('OpenAI Requests'),
  failedOpenAiRequests: new IncrementStatistic('Failed OpenAI Requests'),
  successfulOpenAiRequests: new DerivedStatistic('Successful OpenAI Requests', () => Statistics.openAiRequests.get() - Statistics.failedOpenAiRequests.get()),
  openAiPromptTokens: new IncrementStatistic('OpenAI Prompt Tokens'),
  openAiCompletionTokens: new IncrementStatistic('OpenAI Completion Tokens'),
  openAiTotalTokens: new DerivedStatistic('OpenAI Total Tokens', () => Statistics.openAiPromptTokens.get() + Statistics.openAiCompletionTokens.get()),
  openAiTokensPerRequest: new DerivedStatistic('OpenAI Tokens Per Request', () => Statistics.openAiTotalTokens.get() / Statistics.successfulOpenAiRequests.get()),
  openAiTokensPerHour: new DerivedStatistic('OpenAI Tokens Per Hour', () => Statistics.openAiTotalTokens.get() / (Date.now() - Statistics.openAiTotalTokens._resetTime) * 60 * 60 * 1000),
  openAiEstimatedCost: new DerivedStatistic('OpenAI Estimated Cost', () => `$${Statistics.openAiTotalTokens.get() * OPEN_AI_COST_PER_TOKEN}`),
  openAiEstimatedCostPerRequest: new DerivedStatistic('OpenAI Estimated Cost Per Request', () => `$${Statistics.openAiTokensPerRequest.get() * OPEN_AI_COST_PER_TOKEN}`),
  openAiEstimatedCostPerHour: new DerivedStatistic('OpenAI Estimated Cost Per Hour', () => `$${Statistics.openAiTokensPerHour.get() * OPEN_AI_COST_PER_TOKEN}`),
  openAiFinishReasons: new GroupStatistic('OpenAI Finish Reasons', IncrementStatistic),
  openAiIncorrectPromptOptionGeneration: new IncrementStatistic('OpenAI Incorrect Prompt Option Generation'),
  generationRequests: new IncrementStatistic('Generation Requests'),
  slowGenerationRequests: new IncrementStatistic('Slow Generation Requests'),
  storyRootRequests: new IncrementStatistic('Story Root Requests'),
  nonexistentApiRequests: new IncrementStatistic('Nonexistent API Requests'),
  invalidMethodRequests: new IncrementStatistic('Invalid Method Requests'),
  malformedRequests: new IncrementStatistic('Malformed Requests'),
  unauthorizedRequests: new IncrementStatistic('Unauthorized Requests'),
  failedResponses: new IncrementStatistic('Failed Responses'),
  storyNodeRequests: new IncrementStatistic('Story Node Requests'),
  storyNodesCreated: new IncrementStatistic('Story Nodes Created'),
  storyNodesDeleted: new IncrementStatistic('Story Nodes Deleted'),
  storySummariesCreated: new IncrementStatistic('Story Summaries Created'),
  genreStoryNodesCreated: new GroupStatistic('Genre Story Nodes Created', IncrementStatistic),
  forEach (callback) {
    for (const statistic of Object.values(this)) {
      if (statistic instanceof Statistic) {
        callback(statistic);
      }
    }
  },
  reset () {
    for (const statistic of Object.values(this)) {
      if (statistic instanceof Statistic) {
        statistic.reset();
      }
    }
  },
  toString () {
    const lines = [];
    this.forEach(statistic => {
      lines.push(statistic.toString());
    });
    return lines.join('\n');
  },
  log () {
    Logger.statsLog();
  }
}

export default Statistics;