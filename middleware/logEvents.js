import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';

import { existsSync } from 'fs';
import { promises as fsPromises } from 'fs';

import { fileURLToPath } from 'url'
import { join, dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const logEvents = async (message, logName = "errorlog.txt") => {
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    try {
        if (!existsSync(join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(join(__dirname, '..', 'logs'));
        }
        await fsPromises.appendFile(join(__dirname, '..', 'logs', logName), logItem);
        return true;
    } catch {
        console.error("logEvents() failed");
        return false;
    }
}

export const logReqs = (req, res, next) => {
    const ip = (req.headers['x-forwarded-for'] || req.headers.origin || req.socket.remoteAddress).split(':').pop()
    logEvents(`${req.method}\t${ip}\t${req.url}`, 'reqLog.txt')
    next()
}

  /**
   * Search for data in a log
   * @param {string} logFile name of a log file
   * @param {string | number} data data to search for in log file
   * @returns True if data found, false otherwise
   */
export const logSearch = async (logFile, data) => {
    try {
        if (!existsSync(join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(join(__dirname, '..', 'logs'));
        }

        if (existsSync(join(__dirname, '..', 'logs', `${logFile}`))) {
            let fileHandle = await fsPromises.open(join(__dirname, '..', 'logs', `${logFile}`))
            //search for data if file
            for await (const line of fileHandle.readLines()) {
                //console.log(`logsearch: ${line} vs ${data}`)
                if (line.includes(data)) {
                    //console.log(`${data} found in logSearch`)
                    return true
                }
            }
        } else {
            return false
        }
    } catch (err) {
        console.error(`logSearch() error: ${err}`)
        return false
    }

    //console.log(`${data} NOT found in logSearch`)
    return false
}
