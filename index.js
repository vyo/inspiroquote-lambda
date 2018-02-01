/**
 * Wrapper for https://inspiroquote.herokuapp.com
 **/

'use strict'

const INSPIROQUOTE_API_KEY = process.env.INSPIROQUOTE_API_KEY

const Alexa = require('alexa-sdk')
const Please = require('request-promise')

const APP_ID = process.env.ALEXA_APP_ID

var self
const heroku = function (language) {
  // if (language === 'en') {
  //   self.emit(':ask', preludeQuotes[Math.random() * (preludeQuotes.length)])
  // }
  // retrieve a random quote from InspiroBot
  var inspirationRequest = {
    uri: 'https://inspiroquote.herokuapp.com/inspiration',
    qs: {
      'language': language
    },
    headers: {
      'x-inspiroquote-apikey': INSPIROQUOTE_API_KEY
    },
    json: true
  }

  Please(inspirationRequest)
    .then(function (response) {
      self.emit(':tell', response.quote)
    })
    .catch(function (err) {
      console.log(err)
      if (language === 'de') {
        self.emit(':tell', 'Oh nein, Irgendetwas ist da schiefgelaufen.')
      } else {
        self.emit(':tell', 'Oh no, something went wrong.')
      }
    })
}
const germanHandlers = {
  'LaunchRequest': function () {
    self = this
    heroku('de')
  },
  'inspire': function () {
    self = this
    heroku('de')
  },
  'AMAZON.HelpIntent': function () {
    const speechOutput = this.t('HELP_MESSAGE')
    const reprompt = this.t('HELP_MESSAGE')
    this.emit(':ask', speechOutput, reprompt)
  },
  'AMAZON.CancelIntent': function () {
    this.emit(':tell', this.t('STOP_MESSAGE'))
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', this.t('STOP_MESSAGE'))
  }
}
const englishHandlers = {
  'LaunchRequest': function () {
    self = this
    heroku('en')
  },
  'inspire': function () {
    self = this
    heroku('en')
  },
  'AMAZON.HelpIntent': function () {
    const speechOutput = this.t('HELP_MESSAGE')
    const reprompt = this.t('HELP_MESSAGE')
    this.emit(':ask', speechOutput, reprompt)
  },
  'AMAZON.CancelIntent': function () {
    this.emit(':tell', this.t('STOP_MESSAGE'))
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', this.t('STOP_MESSAGE'))
  }
}

exports.handler = function (event, context) {
  const alexa = Alexa.handler(event, context)
  alexa.appId = APP_ID

  var locale = event.request.locale
  if (locale === 'de-DE') {
    alexa.registerHandlers(germanHandlers)
  } else {
    alexa.registerHandlers(englishHandlers)
  }

  console.log(event)

  alexa.execute()
}

