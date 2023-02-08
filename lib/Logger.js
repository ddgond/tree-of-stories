import fs from 'fs';
import {getCurrentDateString, getCurrentTimeString, onceADay} from "./utilities";
import Statistics from "./Statistics";

const ARCHIVE_DIRECTORY = 'archive';
const LOG_FILE = 'log.txt';
const ERROR_LOG_FILE = 'error_log.txt';
const OPENAI_LOG_FILE = 'openai_log.txt';
const STATS_LOG_FILE = 'stats_log.txt';

const Logger = {
    log: function (message, reason) {
        if (reason) {
            message = `${message} (${reason})`;
        }
        console.log(message);
        fs.appendFile(LOG_FILE, `${getCurrentTimeString()}: ${message}\n`, function (err) {
            if (err) {
                console.error(err);
            }
        });
    },
    error: function (message, reason) {
        if (reason) {
            message = `${message} (${reason})`;
        }
        console.error(message);
        fs.appendFile(ERROR_LOG_FILE, `${getCurrentTimeString()}: ${message}\n`, function (err) {
            if (err) {
                console.error(err);
            }
        });
    },
    openAiLog: function (prompt, response, finishReason, totalTokens) {
        fs.appendFile(OPENAI_LOG_FILE, `TIME: ${getCurrentTimeString()}\nFINISH REASON: ${finishReason}\nTOTAL TOKENS: ${totalTokens}\nPROMPT: ${prompt}\nRESPONSE: ${response}\n============================\n\n`, function (err) {
            if (err) {
                console.error(err);
            }
        });
    },
    statsLog: function () {
        fs.appendFile(STATS_LOG_FILE, `TIME: ${getCurrentTimeString()}\n${Statistics.toString()}\n============================\n\n`, function (err) {
            if (err) {
                console.error(err);
            }
        });
    },
    archive: async function () {
        if (!fs.existsSync(ARCHIVE_DIRECTORY)) {
            fs.mkdirSync(ARCHIVE_DIRECTORY);
        }
        const archiveFile = `${ARCHIVE_DIRECTORY}/log_${getCurrentDateString()}.txt`;
        fs.rename(LOG_FILE, archiveFile, function (err) {
            if (err) {
                console.error(err);
            }
        });
        const errorArchiveFile = `${ARCHIVE_DIRECTORY}/error_log_${getCurrentDateString()}.txt`;
        fs.rename(ERROR_LOG_FILE, errorArchiveFile, function (err) {
            if (err) {
                console.error(err);
            }
        });
        const openAiArchiveFile = `${ARCHIVE_DIRECTORY}/openai_log_${getCurrentDateString()}.txt`;
        fs.rename(OPENAI_LOG_FILE, openAiArchiveFile, function (err) {
            if (err) {
                console.error(err);
            }
        });
        const statsArchiveFile = `${ARCHIVE_DIRECTORY}/stats_log_${getCurrentDateString()}.txt`;
        fs.rename(STATS_LOG_FILE, statsArchiveFile, function (err) {
            if (err) {
                console.error(err);
            }
        });
    }
}

onceADay(() => {
    Statistics.log();
    Logger.archive();
    Statistics.reset();
}, 1);


export default Logger;