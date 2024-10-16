import { createHash } from 'crypto';
import { logEvents,logSearch } from '../middleware/logEvents.js';
import dotenv from 'dotenv'
dotenv.config()

/** 
* set this to a random string
*/
const HASHCASH_SALT = process.env.HASHCASH_SALT || "aComplexHashSalty";

/** 
 * set this to a path and file name to store recently submitted stamps
*/ 
const STAMP_LOG = "stamps.log";
 
 /*
  * number of bits to collide
  * Approximate number of hash guesses needed for difficulty target of:
  * 1-4: 10
  * 5-8: 100
  * 9-12: 1,000
  * 13-16: 10,000
  * 17-20: 100,000
  * 21-24: 1,000,000
  * 25-28: 10,000,000
  * 29-32: 100,000,000
  */
export const HASHCASH_DIFFICULTY = process.env.HASHCASH_DIFFICULTY || 15;

/**
 * time flexibility, in minutes, between stamp generation and expiration
 * allows time for clock drift and for filling out form
 * Note that higher values require higher resources to validate
 * that a given puzzle has not expired
 */
const HASHCASH_TIME_WINDOW = process.env.HASHCASH_TIME_WINDOW || 10;

  /**
   * Output sha256 hash of a string
   * @param {string} ascii data to hash
   * @returns {string} sha256 hash
   */
  function hc_HashFunc(ascii) {
    return createHash('sha256').update(ascii).digest('hex');
  }

/**
 * Get the first num_bits of data from this string
 * @param {string} hex_string 
 * @param {number} num_bits 
 * @returns 
 */
function hc_ExtractBits(hex_string, num_bits) {
  let bit_string = "";
  let num_chars = Math.ceil(num_bits / 4);

  for(let i = 0; i < num_chars; i++) {
      //convert hex to binary and left pad with 0s
      bit_string += ('0000' + parseInt(hex_string[i],16).toString(2)).slice(-4)
  }

  //console.log(`Requested ${num_bits} bits from ${hex_string}, returned ${bit_string} as ${bit_string.slice(0,num_bits)}`);
  return bit_string.slice(0,num_bits);
}

/**
 * Generate a stamp
 * @param {string} ip ip address of requesting client
 * @returns {string}
 */
export function hc_CreateStamp(ip) {  
  //time in minutes
  const timestamp = (Math.round(Date.now() / 60000)).toString();
  let stamp = hc_HashFunc(timestamp + ip + HASHCASH_SALT);
  return stamp
}

// check that the stamp is within our allowed time window
// this function also implicitly validates that the IP address and salt match
function hc_CheckExpiration(a_stamp, ip) {
  let tempnow = Math.round(Date.now() / 60000)  
  for (let i = -1 * HASHCASH_TIME_WINDOW; i < HASHCASH_TIME_WINDOW; i++) {
    if (a_stamp === hc_HashFunc((tempnow + i).toString() + ip + HASHCASH_SALT)) {
      return true;
    }
  }
  console.log("stamp expired");
  return false;
}

// check that the hash of the stamp + nonce meets the difficulty target
function hc_CheckProofOfWork(difficulty, stamp, nonce) {

  // get hash of stamp & nonce
  const work = hc_HashFunc(stamp + nonce);
  const leadingBits = hc_ExtractBits(work, difficulty);
  //console.log(`checking ${leadingBits.length} leading bits of 0x${work} for difficulty ${difficulty} match`);

  // if the leading bits are all 0, the difficulty target was met
  return ( ((leadingBits.length) > 0) && (parseInt(leadingBits) == 0) );
}

/**
 * checks validity, expiration, and difficulty target for a stamp
 * @param {string} stamp 
 * @param {number} client_difficulty 
 * @param {string} nonce 
 * @param {string} ip 
 * @returns true if valid stamp, false otherwise
 */
export async function hc_CheckStamp(stamp, client_difficulty, nonce, ip) {
  //console.log(`difficulty comparison: ${client_difficulty} vs ${HASHCASH_DIFFICULTY}`);
  if (client_difficulty != HASHCASH_DIFFICULTY) return false;

  let expectedLength = hc_HashFunc(hc_uuid()).length;
  //console.log(`stamp size: ${stamp.length} expected: ${expectedLength}`);
  if (stamp.length != expectedLength) return false;

  if (hc_CheckExpiration(stamp, ip)) {
    //console.log("PoW puzzle has not expired");
  } else {
    console.log("PoW puzzle expired");
    return false;
  }

  // check the actual PoW
  if (hc_CheckProofOfWork(HASHCASH_DIFFICULTY, stamp, nonce)) {
    //console.log("Difficulty target met.");
  } else {
    console.log("Difficulty target was not met.");
    return false;
  }

  // check if this puzzle has already been used to submit a message
  await logSearch(STAMP_LOG, stamp)
    .then((val) => {
      if (val) {
        console.log(`Stamp: ${stamp} exists in log.`);
        return false;
      } else {
        //console.log(`Stamp: ${stamp} NOT found in log.`);
      }
    })
    .catch(() => {
      console.log(`logSearch error: hc_CheckStamp()`)
    })

  //add stamp to log
  await logEvents(`${ip}\t${stamp}`, STAMP_LOG)

  return true;
}

/**
 * Generate a 14 character unique hex id
 * @returns {string}
 */
function hc_uuid() {
  return Math.random().toString(16).slice(2)
}

  
