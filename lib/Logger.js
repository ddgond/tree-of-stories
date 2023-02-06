import fs from 'fs';
import {getCurrentDateString, getCurrentTimeString, onceADay} from "./utilities";

const LOG_FILE = 'log.txt';
const ERROR_LOG_FILE = 'error_log.txt';

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
    archive: async function () {
        const archiveDirectory = 'archive';
        if (!fs.existsSync(archiveDirectory)) {
            fs.mkdirSync(archiveDirectory);
        }
        const archiveFile = `${archiveDirectory}/log_${getCurrentDateString()}.txt`;
        fs.rename(LOG_FILE, archiveFile, function (err) {
            if (err) {
                console.error(err);
            }
        });
        const errorArchiveFile = `${archiveDirectory}/error_log_${getCurrentDateString()}.txt`;
        fs.rename(ERROR_LOG_FILE, errorArchiveFile, function (err) {
            if (err) {
                console.error(err);
            }
        });
    }
}

onceADay(Logger.archive, 1);


export default Logger;