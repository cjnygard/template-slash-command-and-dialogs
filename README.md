# Tribal Terms Slackbot

## Creating a lexicon using a Slash Command and a Dialog

Use a slash command and a dialog to create a lexicon for tribal knowledge in a 3rd-party system.
Once it has been created, send a message to the user with the term:definition that they created

![tribal-terms-dialog](https://user-images.githubusercontent.com/700173/30929774-5fe9f0e2-a374-11e7-958e-0d8c362f89a3.gif)

## Setup

#### Create a Slack app

1. Create an app at api.slack.com/apps
1. Navigate to the OAuth & Permissions page and add the following scopes:
    * `commands`
    * `users:read`
    * `users:read:email`
    * `chat:write:bot`
1. Click 'Save Changes' and install the app

#### Run locally
1. Get the code
    * Either clone this repo and run `npm install`
1. Set the following environment variables to `.env` (see `.env.sample`):
    * `SLACK_ACCESS_TOKEN`: Your app's `xoxp-` token (available on the Install App page)
    * `PORT`: The port that you want to run the web server on
    * `SLACK_VERIFICATION_TOKEN`: Your app's Verification Token (available on the Basic Information page)
1. If you're running the app locally:
    1. Start the app (`npm start`)
    1. In another window, start ngrok on the same port as your webserver (`ngrok http $PORT`)

#### Add a Slash Command
1. Go back to the app settings and click on Slash Commands.
1. Click the 'Create New Command' button and fill in the following:
    * Command: `/whatis`
    * Request URL: Your ngrok + /slack/whatis
    * Short description: `Lookup a term definition`
    * Usage hint: `[the term you want to lookup]`
1. Click the 'Create New Command' button and fill in the following:
    * Command: `/define`
    * Request URL: Your ngrok + /slack/define
    * Short description: `Create a term definition`
    * Usage hint: `[the term you want to define]`
1. Save and reinstall the app

#### Enable Interactive Components
1. Go back to the app settings and click on Interactive Components.
1. Set the Request URL to your ngrok + /interactive-component
