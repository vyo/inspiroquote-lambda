/**
 * Wrapper for https://inspiroquote.herokuapp.com
 **/

'use strict'

const INSPIROQUOTE_API_KEY = process.env.INSPIROQUOTE_API_KEY

const Alexa = require('alexa-sdk')
const Promise = require('bluebird')
const Please = require('request-promise')

const APP_ID = process.env.ALEXA_APP_ID

const miniQuotes = {
  en: require('./mini-quotes-en.js'),
  de: require('./mini-quotes-de.js')
// ja: require('./mini-quotes-ja.js')
}

const errorQuotes = {
  en: require('./error-quotes-en.js'),
  de: require('./error-quotes-de.js')
  // ja: require('./error-quotes-ja.js')
}

const randomInRange = function (max) {
  return Math.floor(Math.random() * max)
}

let self
let quote

const intro = function (language) {
  const introQuote = function () {
    return miniQuotes[language][randomInRange(miniQuotes[language].length)]
  }
  self.emit(':ask', introQuote(), introQuote())
}

const heroku = function (language) {
  // const requestId = self.event.request.requestId
  // const token = self.event.context.System.apiAccessToken
  // const endpoint = self.event.context.System.apiEndpoint
  // const ds = new Alexa.services.DirectiveService()

  // let introQuote = miniQuotes[language][randomInRange(miniQuotes[language].length)]
  // const directive = new Alexa.directives.VoicePlayerSpeakDirective(requestId, introQuote)
  // ds.enqueue(directive, endpoint, token)
  //   .then(function (response) {
  //     console.log('initial mini quote')
  //   })
  //   .catch((err) => {
  //     console.log(err)
  //   })

  const inspirationRequest = {
    uri: 'https://inspiroquote.herokuapp.com/inspiration',
    qs: {
      'language': language
    },
    headers: {
      'x-inspiroquote-apikey': INSPIROQUOTE_API_KEY
    },
    json: true
  }

  const abort = new Promise((resolve, reject) => {
    let wait = setTimeout(() => {
      clearTimeout(wait)
      resolve(errorQuotes[language][randomInRange(errorQuotes[language].length)])
      // resolve({
      //   type: 'SSML',
      //   ssml: errorQuotes[language][randomInRange(errorQuotes[language].length)]
      // })
    }, 5000)
  })

  Promise.some([
    abort,
    Please(inspirationRequest)
    .then(function (response) {
      return response.quote
      // return {
      //   type: 'SSML',
      //   ssml: '<speak>' + response.quote + '</speak>'
      // }
    })
  ], 1)
    .then(function (responses) {
      console.log(responses)
      if (responses.length > 0) {
        quote = responses[0]
        self.emit(':ask', responses[0])
      } else {
        self.emit(':ask', errorQuotes[language][randomInRange(errorQuotes[language].length)])
      }
    })
    .catch(function (err) {
      console.log(err)
      self.emit(':ask', errorQuotes[language][randomInRange(errorQuotes[language].length)])
    })
}

const germanHandlers = {
  'LaunchRequest': function () {
    self = this
    intro('de')
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
  'AMAZON.RepeatIntent': function () {
    // this.emit(':tell', this.t('REPEAT_MESSAGE'))
    this.emit(':ask', quote)
  },
  'AMAZON.CancelIntent': function () {
    // this.emit(':tell', this.t('STOP_MESSAGE'))
    this.emit(':tell', miniQuotes['de'][randomInRange(miniQuotes['de'].length)])
  },
  'AMAZON.StopIntent': function () {
    // this.emit(':tell', this.t('STOP_MESSAGE'))
    this.emit(':tell', miniQuotes['de'][randomInRange(miniQuotes['de'].length)])
  }
}
const englishHandlers = {
  'LaunchRequest': function () {
    self = this
    intro('en')
    // heroku('en')
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
  'AMAZON.RepeatIntent': function () {
    // this.emit(':tell', this.t('REPEAT_MESSAGE'))
    this.emit(':ask', quote)
  },
  'AMAZON.CancelIntent': function () {
    // this.emit(':tell', this.t('STOP_MESSAGE'))
    this.emit(':tell', miniQuotes['en'][randomInRange(miniQuotes['en'].length)])
  },
  'AMAZON.StopIntent': function () {
    // this.emit(':tell', this.t('STOP_MESSAGE'))
    this.emit(':tell', miniQuotes['en'][randomInRange(miniQuotes['en'].length)])
  }
}

exports.handler = function (event, context) {
  const alexa = Alexa.handler(event, context)
  alexa.appId = APP_ID

  const locale = event.request.locale
  if (locale === 'de-DE') {
    alexa.registerHandlers(germanHandlers)
  } else {
    alexa.registerHandlers(englishHandlers)
  }

  console.log(event)

  alexa.execute()
}

