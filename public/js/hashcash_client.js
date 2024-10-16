// full implementation of SHA265 hashing algorithm
function sha256(ascii) {
    function rightRotate(value, amount) {
        return (value>>>amount) | (value<<(32 - amount));
    };

    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length'
    var i, j; // Used as a counter across the whole file
    var result = ''

    var words = [];
    var asciiBitLength = ascii[lengthProperty]*8;

    // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
    // (we actually calculate the first 64, but extra values are just ignored)
    var hash = sha256.h = sha256.h || [];
    // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
    var k = sha256.k = sha256.k || [];
    var primeCounter = k[lengthProperty];

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
                isComposite[i] = candidate;
            }
            hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
            k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
        }
    }

    ascii += '\x80' // Append Ƈ' bit (plus zero padding)
    while (ascii[lengthProperty]%64 - 56) ascii += '\x00' // More zero padding
    for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        if (j>>8) return; // ASCII check: only accept characters in range 0-255
        words[i>>2] |= j << ((3 - i)%4)*8;
    }
    words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
    words[words[lengthProperty]] = (asciiBitLength)

    // process each chunk
    for (j = 0; j < words[lengthProperty];) {
        var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
        var oldHash = hash;
        // This is now the undefinedworking hash", often labelled as variables a...g
        // (we have to truncate as well, otherwise extra entries at the end accumulate
        hash = hash.slice(0, 8);

        for (i = 0; i < 64; i++) {
            var i2 = i + j;
            // Expand the message into 64 words
            var w15 = w[i - 15], w2 = w[i - 2];

            // Iterate
            var a = hash[0], e = hash[4];
            var temp1 = hash[7]
                + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
                + ((e&hash[5])^((~e)&hash[6])) // ch
                + k[i]
                // Expand the message schedule if needed
                + (w[i] = (i < 16) ? w[i] : (
                        w[i - 16]
                        + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3)) // s0
                        + w[i - 7]
                        + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10)) // s1
                    )|0
                );
            // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
            var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
                + ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2])); // maj

            hash = [(temp1 + temp2)|0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
            hash[4] = (hash[4] + temp1)|0;
        }

        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i])|0;
        }
    }

    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            var b = (hash[i]>>(j*8))&255;
            result += ((b < 16) ? 0 : '') + b.toString(16);
        }
    }
    return result;
}

// replace with your desired hash function
function hc_HashFunc(x) {
    return sha256(x);
}

function setFormData(x, y) {
  var z = document.getElementById(x);
  if(z) z.value = y;
}

function getFormData(x) {
  var z = document.getElementById(x);
  if(z)
    return z.value;
  else
    return '';
}

// convert hex char to binary string
function hc_HexInBin(x) {
  var ret = '';
  switch(x.toUpperCase()) {
    case '0': return '0000';
    case '1': return '0001';
    case '2': return '0010';
    case '3': return '0011';
    case '4': return '0100';
    case '5': return '0101';
    case '6': return '0110';
    case '7': return '0111';
    case '8': return '1000';
    case '9': return '1001';
    case 'A': return '1010';
    case 'B': return '1011';
    case 'C': return '1100';
    case 'D': return '1101';
    case 'E': return '1110';
    case 'F': return '1111';
    default : return '0000';
    }
}

/**
 * Get the leading number of bits from the string
 * @param {string} hex_string 
 * @param {number} num_bits 
 * @returns {string}
 */
function hc_ExtractBits(hex_string, num_bits) {
  var bit_string = "";
  var num_chars = Math.ceil(num_bits / 4);
  for (var i = 0; i < num_chars; i++)
    bit_string = bit_string + "" + hc_HexInBin(hex_string.charAt(i));

  bit_string = bit_string.substr(0, num_bits);
  return bit_string;
}

// check if a given nonce is a solution for this stamp and difficulty
// the difficulty number of leading bits must all be 0 to have a valid solution
function hc_CheckNonce(difficulty, stamp, nonce) {
  var col_hash = hc_HashFunc(stamp + nonce);
  var check_bits = hc_ExtractBits(col_hash, difficulty);

  return (check_bits == 0);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// iterate through as many nonces as it takes to find one that gives us a solution hash at the target difficulty
async function hc_findHash() {
  var hc_stamp = getFormData('hc_stamp');
  var hc_difficulty = getFormData('hc_difficulty');
  
  // check to see if we already found a solution
  var form_nonce = getFormData('hc_nonce');
  if (form_nonce && hc_CheckNonce(hc_difficulty, hc_stamp, form_nonce)) {
    // we have a valid nonce; enable the form submit button
    document.getElementById("modal-container").style.display = "block";
    document.getElementById('hashTime').innerHTML = "Init Nonce Found" 
    await sleep(1000)
    document.getElementById("modal-container").style.display = "none";
    return true;
  }

  var nonce = 1;
  document.getElementById("modal-container").style.display = "block"; 

  while (!hc_CheckNonce(hc_difficulty, hc_stamp, nonce)) {
    nonce++;
    if (nonce % 10000 == 0) {
      let remaining = Math.round((Math.pow(2, hc_difficulty) - nonce) / 10000) * 10000;
      //document.getElementById('countdown').innerHTML = "     Approximately " + remaining + " hashes remaining before form unlocks.";
      //document.getElementById('hashTime').innerHTML =        remaining + " hashes";
      if ((nonce/10000)%3 == 0) { 
        document.getElementById('hashTime').innerHTML = "Validating and uploading registration... ";
      } else { 
        document.getElementById('hashTime').innerHTML = "Please wait... ";
      }
      await sleep(100); // don't peg the CPU and prevent the browser from rendering these updates
    }
  }
  
  setFormData('hc_nonce', nonce);
  
  // we have a valid nonce; enable the form submit button
  //document.getElementById('countdown').innerHTML = "Nonce Found";
  document.getElementById('hashTime').innerHTML = "Upload Complete... "
  await sleep(1500)
  document.getElementById("modal-container").style.display = "none"; 
  document.getElementById("contact-form").submit();

  return true;
}

function hc_handleSubmit() {
  const form = document.querySelector('form')
  const name_error = document.getElementById('name-error-msg')
  const email_error = document.getElementById('email-error-msg')
  const comment_error = document.getElementById('comment-error-msg')
  let errorAlert = ""

  name_error.style.display = 'none'
  email_error.style.display = 'none'
  comment_error.style.display = 'none'

  function formPreCheck(e) {
    e.preventDefault()

    const formData = new FormData(form)
    fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participation: formData.get('participation'),
        name: formData.get('name'),
        email: formData.get('email'),
        comment: formData.get('comment'),
        region: formData.get('region'),
        firstPref: formData.get('firstPref'),
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.errors) {
          if (data.errors.participation) {
            errorAlert += `\n - ${data.errors.participation.msg}`
          }
          if (data.errors.name) {
            name_error.innerHTML = data.errors.name.msg
            errorAlert += `\n - ${data.errors.name.msg}`
            name_error.style.display = 'block'
          } else {
            name_error.style.display = 'none'
          }
          if (data.errors.email) {
            email_error.innerHTML = data.errors.email.msg
            errorAlert += `\n - ${data.errors.email.msg}`
            email_error.style.display = 'block'
          } else {
            email_error.style.display = 'none'
          }
          if (data.errors.comment) {
            comment_error.innerHTML = data.errors.comment.msg
            errorAlert += `\n - ${data.errors.comment.msg}`
            comment_error.style.display = 'block'
          } else {
            comment_error.style.display = 'none'
          }
          if (data.errors.region) {
            errorAlert += `\n - ${data.errors.region.msg}`
          } 
          if (data.errors.firstPref) {
            errorAlert += `\n - ${data.errors.firstPref.msg}`
          } 
          alert(`Please check the registration form for errors.:${errorAlert}`)
          errorAlert = ""
        } else {
          name_error.innerHTML = ""
          email_error.innerHTML = ""
          comment_error.innerHTML = ""
          name_error.style.display = 'none'
          email_error.style.display = 'none'
          comment_error.style.display = 'none'

          form.removeEventListener('submit', formPreCheck)
          hc_findHash()
        }
      })
  }

  form.addEventListener('submit', formPreCheck)
}