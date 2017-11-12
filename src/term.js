const axios = require('axios');
const debug = require('debug')('slash-command-template:term');
const qs = require('querystring');

termMap = new Map();
termMap.set('CGI', 'Cengage Global Id, a generic UUID created for each entity within the SOA Datamodel');

/*
 * determine if the given term has a definition
 */
const exists = function (userId, term) {
  console.log(`exists: ${term}`);
  return termMap.has(term);
};

/*
 * lookup the given term and return a text string representing the definition
 */
const lookup = function (userId, term) {
  console.log(`lookup: ${userId}:${term}`);
  if (true) {
    definition = termMap.get(term);
  } else {
    const entry = {userId: userId, term: term};
    axios.get('https://lexicon.cengage.com/api/definition', qs.stringify(entry))
         .then((result) => {
           debug('lookup: %o', result.data);
           definition = result.data.definition;
         })
         .catch((err) => {
           debug('lookup error: %o', err);
           console.error(err);
         });
  }
  return definition;
};

/*
 * lookup the given term and return a text string representing the definition
 */
const backup = function (userId) {
  console.log(`backup: ${userId}`);
  data = new Array();
  if (true) {
    termMap.forEach( (v, k) => data.push({term: k, definition: v}));
  } else {
    const entry = {userId: userId};
    axios.get('https://lexicon.cengage.com/api/definitions', qs.stringify(entry))
         .then((result) => {
           debug('lookup: %o', result.data);
           data = result.data;
         })
         .catch((err) => {
           debug('lookup error: %o', err);
           console.error(err);
         });
  }
  return data;
};


// Create term definition. Call users.find to get the user's email address
// from their user ID
const define = (userId, term, definition) => {
  console.log(`define: ${userId}:${term}:${definition}`);
  if (true) {
    termMap.set(term, definition);
  } else {
    const entry = {userId: userId, term: term, definition: definition};
    axios.post('https://lexicon.cengage.com/api/definition', qs.stringify(entry))
         .then((result) => {
           debug('define: %o', result.data);
           definition = result.data.definition;
         })
         .catch((err) => {
           debug('define error: %o', err);
           console.error(err);
         });
  }

};

module.exports = {exists, lookup, define, backup};
