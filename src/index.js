require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const FormData = require('form-data');
const qs = require('querystring');
const term = require('./term');
const debug = require('debug')('slash-command-template:index');
const Readable = require('stream').Readable;

const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 */
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  debug('Root docs requested');
  res.send('<h2>The TribalTerms app is running</h2> <p>Follow the' +
           ' instructions in the README to configure the TribalTerms App and your environment variables.</p>');
});

var defineWordDialog = function (trigger_id, text, definition) {
  console.log(`Defining term: ${text}`);

  // create the dialog payload - includes the dialog structure, Slack API token,
  // and trigger ID
  const widgets = {
    title: 'Submit definition',
    callback_id: 'submit-definition',
    submit_label: 'Submit',
    elements: [
      {
        label: 'Term',
        type: 'text',
        name: 'term',
        value: text
      },
      {
        label: 'Definition',
        type: 'textarea',
        name: 'definition',
        value: definition,
        hint: `definition of the term '${text}'`
      }
    ]
  };

  const dialog = {
    token: process.env.SLACK_ACCESS_TOKEN,
    trigger_id,
    dialog: JSON.stringify(widgets)
  };

  const content = qs.stringify(dialog);
  console.log(`Posting dialog: ${content}`);

  // open the dialog by calling dialogs.open method and sending the payload
  return axios.post('https://slack.com/api/dialog.open', content)
              .then((result) => {
                console.log('dialog.open: %o', result.data);
                debug('dialog.open: %o', result.data);
//            res.send('');
              })
              .catch((err) => {
                console.log(`dialog.open failed: ${err}`);
                debug('dialog.open call failed: %o', err);
//            res.sendStatus(500);
              });
};

var postMessage = function (channelId, userId, text) {
  console.log(`Posting message: ${text}`);
  const message = {
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: channelId,
    user: userId,
    text: text
  };

  const content = qs.stringify(message);
  console.log(`Posting message: ${content}`);
  axios.post('https://slack.com/api/chat.postEphemeral', content)
       .then((result) => {
         console.log('sendConfirmation: %o', result.data);
         debug('sendConfirmation: %o', result.data);
       })
       .catch((err) => {
         debug('sendConfirmation error: %o', err);
         console.error(err);
       });
};


var returnDefinition = function (channelId, userId, text, definition, prefix) {
  console.log(`Returning definition: ${text}:${definition}`);
  postMessage(channelId, userId, `${prefix}*${text}*:\n    ${definition}`);
};

var doImport = function (channelId, userId) {
  console.log('Import not implemented yet');
  postMessage(channelId, userId, 'Import not implemented yet');
};

var doExport = function (channelId, userId, data) {
  console.log(`Returning backup: ${userId}:${channelId}`);
  const formData = new FormData();
  const fileBufferData = JSON.stringify(data);
  console.log(`Backup data: ${fileBufferData}`);


  if (true) {

    var s = new Readable();
    s.push(fileBufferData);
    s.push(null);
    s.path = 'lexicon-backup.json';

    formData.append('file', s);
  } else {

    const fileData = {
      value: fileBufferData,
      options: {
        filename: 'lexicon-backup.json',
        contentType: 'mime-type', // optional, will be guessed by `form-data` module
        knownLength: fileBufferData.length // optional, will be deduced by `form-data` module
      }
    };

    formData.append('file', fileData);
  }

  const config = {
    headers: {
      'content-type': 'multipart/form-data'
    }
  };

  const message = {
    token: process.env.SLACK_ACCESS_TOKEN,
    file: formData,
    channels: channelId,
    filename: 'lexicon-backup.json',
    filetype: 'json',
    initial_comment: 'Lexicon backup file',
    title: 'Lexicon Backup'
  };

  const content = qs.stringify(message);

  axios.post('https://slack.com/api/file.upload', content, config)
       .then((result) => {
         console.log('sendConfirmation: %o', result.data);
         debug('sendConfirmation: %o', result.data);
       })
       .catch((err) => {
         debug('sendConfirmation error: %o', err);
         console.error(err);
       });
};


/*
 * Endpoint to receive /whatis slash command from Slack.
 * Checks verification token and opens a dialog to capture more info.
 */
app.post('/slack/whatis', (req, res) => {
  // extract the verification token, slash command text,
  // and trigger ID from payload
  const {token, text, trigger_id, channel_id, user_id} = req.body;

  console.log(`Request data: ${token}:${text}:${trigger_id}`);
  // check that the verification token matches expected value
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    // create the dialog payload - includes the dialog structure, Slack API token,
    // and trigger ID

    // immediately respond with a empty 200 response to let
    // Slack know the command was received
    res.send('');

    if (!term.exists(user_id, text)) {
      defineWordDialog(trigger_id, text, "")
    } else {
      returnDefinition(channel_id, user_id, text, term.lookup(user_id, text), "");
    }
  } else {
    debug('Verification token mismatch');
    console.log('Verification token mismatch');
    res.sendStatus(500);
  }
});

/*
 * Endpoint to receive /define slash command from Slack.
 * Checks verification token and opens a dialog to capture more info.
 */
app.post('/slack/define', (req, res) => {
  // extract the verification token, slash command text,
  // and trigger ID from payload
  const {token, text, trigger_id, channel_id, user_id} = req.body;

  console.log(`Request data: ${token}:${text}:${trigger_id}`);
  // check that the verification token matches expected value
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    // immediately respond with a empty 200 response to let
    // Slack know the command was received
    res.send('');

    if (!term.exists(user_id, text)) {
      defineWordDialog(trigger_id, text, "")
    } else {
      defineWordDialog(trigger_id, text, term.lookup(user_id, text));
    }
  } else {
    debug('Verification token mismatch');
    console.log('Verification token mismatch');
    res.sendStatus(500);
  }
});


/*
 * Endpoint to receive /lexicon slash command from Slack.
 * Checks verification token and handles management commands
 */
app.post('/slack/lexicon', (req, res) => {
  // extract the verification token, slash command text,
  // and trigger ID from payload
  const {token, text, trigger_id, channel_id, user_id} = req.body;

  console.log(`Request data: ${token}:${text}:${trigger_id}`);
  // check that the verification token matches expected value
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    // immediately respond with a empty 200 response to let
    // Slack know the command was received
    res.send('');

    if ('import' == text) {
      doImport(channel_id, user_id);
    } else if ('export' == text) {
      doExport(channel_id, user_id, term.backup(user_id));
    }
  } else {
    debug('Verification token mismatch');
    console.log('Verification token mismatch');
    res.sendStatus(500);
  }
});

/*
 * Endpoint to receive the dialog submission. Checks the verification token
 * and creates a new term
 */
app.post('/slack/interactive-component', (req, res) => {
  const body = JSON.parse(req.body.payload);
  console.log(`Form submission received: ${body.submission.trigger_id}`);
  debug(`Form submission received: ${body.submission.trigger_id}`);

  // check that the verification token matches expected value
  if (body.token === process.env.SLACK_VERIFICATION_TOKEN) {
    console.log(`Defining: ${body.submission.term}:${body.submission.definition}`);
    debug(`Defining: ${body.submission.term}:${body.submission.definition}`);

    // immediately respond with a empty 200 response to let
    // Slack know the command was received
    res.send('');

    // create term definition
    term.define(body.user.id, body.submission.term, body.submission.definition);
    returnDefinition(body.channel.id, body.user.id, body.submission.term, body.submission.definition,
                     "New definition created:\n");
  } else {
    debug('Token mismatch');
    console.log('Verification token mismatch');
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});
