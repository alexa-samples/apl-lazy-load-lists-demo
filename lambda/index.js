// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/
/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const TOKEN = "aplToken";
const colors = require('colors.json'); //Alphabetical list of color objects with name and hex value.
const sequenceDocument = require('./sequenceDocument.json');
const pagerDocument = require('./pagerDocument.json');

const AMOUNT_COLOR_NEIGHBORS = 15;
const COLOR_LIST_ID = "colorList";
const COLOR_SLOT = "color";
const PROMPT = "What do you want to do?";
const PAGER_SESSION_VAR = "usePager";
const SEQUENCE_SESSION_VAR = "useSequence";

/**
 * Handles the initial launch intent for the skill.
 */
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'This is the APL Lazy Loading Lists Demo. Pick a color by touch or by voice. '
      + 'You can change the list type by selecting \'pager\' or \sequence\' in the header. Showing you a sequence now. ' + PROMPT;

    if (!supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
        .speak('This APL demo requires a device that supports APL. Please try again from a device such as a FireTV or an Echo Show.')
        .getResponse();
    }

    //Return the initial datasources with the dynamic Datasource.
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(PROMPT)
      .addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: TOKEN,
        version: '1.3',
        document: sequenceDocument,
        datasources: createDataSource(0, AMOUNT_COLOR_NEIGHBORS, colors)
      }).getResponse();
  },
};

/**
 * Handles the voice intent to change the color. 
 */
const ChangeColorIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' 
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChangeColorIntent';
  },
  handle(handlerInput) {
    if (!supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
        .speak('This APL demo requires a device that supports APL. Please try again from a device such as a FireTV or an Echo Show.')
        .getResponse();
    }

    const slot = Alexa.getSlot(handlerInput.requestEnvelope, COLOR_SLOT);
    console.log("Slot:  "+ JSON.stringify(slot));
    //Make sure there is a valid slot value.
    if(slot === null || slot.resolutions === null 
      || slot.resolutions.resolutionsPerAuthority === null || slot.resolutions.resolutionsPerAuthority[0] === null) {
      return handlerInput.responseBuilder
        .speak('Hmm, I didn\'t understand that color. You can also tap a color to change the background. ' + PROMPT)
        .reprompt(PROMPT)
        .getResponse();
    }
    const resolvedSlotValue = slot.resolutions.resolutionsPerAuthority[0].values[0].value;
    const index = parseInt(resolvedSlotValue.id);
    const name = resolvedSlotValue.name;

    const speechText = `Okay, changing the color to ${name}. This is at index, ${index}`;

    let document = sequenceDocument;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if(sessionAttributes.hasOwnProperty(PAGER_SESSION_VAR) && sessionAttributes[PAGER_SESSION_VAR]) {
      document = pagerDocument;
    }

    //Return the initial data sources.
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(PROMPT)
      .addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: TOKEN,
        version: '1.3',
        document: document,
        datasources: createDataSource(index, AMOUNT_COLOR_NEIGHBORS, colors)
      })
      .getResponse();
  },
}

/**
 * Button event handler. Sends a new renderDocument for the color selected at the top..
 */
const ButtonEventHandler = {
  canHandle(handlerInput) {
    // Check for SendEvent sent from the button
    return handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent' 
      && handlerInput.requestEnvelope.request.arguments[0] === 'BUTTON_PRESSED';  
  },
  handle(handlerInput) {
    // Figure out which button was pressed by the ID.
    const buttonType = handlerInput.requestEnvelope.request.source.id;
    let name = "sequence", document = sequenceDocument;

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    if(buttonType === 'PAGER_BUTTON') {
      sessionAttributes[PAGER_SESSION_VAR] = true;
      sessionAttributes[SEQUENCE_SESSION_VAR] = false;
      name = "pager document";
      document = pagerDocument;
    } else {
      sessionAttributes[SEQUENCE_SESSION_VAR] = true;
      sessionAttributes[PAGER_SESSION_VAR] = false;
    }

    const speechText = `Okay, changing the APL document to use a ${name}. Resetting to index, 0.`;

    return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(PROMPT)
        .addDirective(
          {
            type: 'Alexa.Presentation.APL.RenderDocument',
            token: TOKEN,
            version: '1.3',
            document: document,
            datasources: createDataSource(0, AMOUNT_COLOR_NEIGHBORS, colors)
          }
        )
        .getResponse();
  }
}

const ChangeColorEventHandler = {
  canHandle(handlerInput) {
    // Check for SendEvent sent from the button
    return handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent';
  },
  handle(handlerInput) {
    // Take argument sent from the button to speak back to the user
    const arguments = handlerInput.requestEnvelope.request.arguments;
    const name = arguments[0];
    const index = arguments[1];
    const speechText = `Okay, changing to the color, ${name}. This is at index, ${index}. `;

    let document = sequenceDocument;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if(sessionAttributes.hasOwnProperty(PAGER_SESSION_VAR) && sessionAttributes[PAGER_SESSION_VAR]) {
      document = pagerDocument;
    }

    //Return the initial datasources.
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(PROMPT)
      .addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: TOKEN,
        version: '1.3',
        document: document,
        datasources: createDataSource(index, AMOUNT_COLOR_NEIGHBORS, colors)
      })
      .getResponse();
  }
};

/**
 * Handles LoadIndexListData requests by returning a SendIndexListData directive.
 */
const LoadIndexListDataRequestHandler = {
  canHandle(handlerInput) {
    //Check to make sure this is a LoadIndexListData Request.
    return handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.LoadIndexListData';
  },
  handle(handlerInput) {
    const requestObject = handlerInput.requestEnvelope.request;
    
    return handlerInput.responseBuilder
      .addDirective({
        type: "Alexa.Presentation.APL.SendIndexListData",
        token: TOKEN,
        correlationToken: requestObject.correlationToken,
        listId: requestObject.listId,
        startIndex: requestObject.startIndex,
        minimumInclusiveIndex: 0,
        maximumExclusiveIndex: colors.length,
        items: getColorsFromIndex(requestObject.startIndex, requestObject.count, colors)
      }).getResponse();
  }
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'This is the APL Lazy Loading Lists Demo. To see it, open the skill without asking for help.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

/**
 * This is used to log APL Runtime Errors. This is incredibly useful for monitoring post-certification.
 */
const APLRuntimeErrorHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.RuntimeError';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // We only have one APL token in this example, but this is useful if you have more than one list ID.
    console.error("Errors for APL Document with token: " + request.token); 
    request.errors.forEach(element => {
      console.error(JSON.stringify(element)); // You can log more complex metrics using the fields on the request object
    });
    
    return handlerInput.responseBuilder.getResponse();
  }
};
/**
 * Generic error handler.
 */
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error Request: ${JSON.stringify(handlerInput.requestEnvelope.request)}`);
    console.log(`~~~~ Error handled: ${error.stack}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I had trouble processing that request. Please try again. ' + PROMPT)
      .reprompt(PROMPT)
      .getResponse();
  },
};

/**
 * Logs the response on every turn.
 */
const LoggingResponseInterceptor = {
  async process(handlerInput) {
    console.log("Logging Response.");
    console.log(JSON.stringify(handlerInput.responseBuilder.getResponse()));
  }
}

//Helper functions:
/**
 * Creates a data source with both static and dynamicIndexList 
 * @param {*} colorIndex 
 * @param {*} count 
 * @param {*} dataArray 
 */
function createDataSource(colorIndex, count, dataArray) {
  return {
    staticDataSource: {
      backgroundColor: dataArray[colorIndex].value,
      headerTitle: "Color Selector"
    },
    colorDynamicSource: { //Dynamic list Data source. This matches the second data source Parameter in the APL document.
      type: "dynamicIndexList",
      listId: COLOR_LIST_ID,
      startIndex: colorIndex,
      minimumInclusiveIndex: 0,
      maximumExclusiveIndex: dataArray.length,
      items:getColorsFromIndex(colorIndex, count, dataArray)
    }
  }
}

/**
 * returns the neighboring colors given the index. 
 * @param {*} index 
 */
function getColorsFromIndex(index, count, dataArray) {
  console.log(`count ${count}, index ${index}`);

  if(index < count / 2) {
    return dataArray.slice(0, count);
  } else if(index > dataArray.length - count/2) {
    return dataArray.slice(dataArray.length - count, dataArray.length);
  } else {
    return dataArray.slice(index, index + count);
  }
}

/**
 * convenience function for checking if the request supports APL.
 * @param {*} handlerInput 
 */
function supportsAPL(handlerInput) {
  const supportedInterfaces = Alexa.getSupportedInterfaces(handlerInput.requestEnvelope);
  const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
  return aplInterface !== null && aplInterface !== undefined;
}

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    ChangeColorIntentHandler,
    LoadIndexListDataRequestHandler,
    ButtonEventHandler,
    ChangeColorEventHandler,
    APLRuntimeErrorHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  ).addResponseInterceptors(
    LoggingResponseInterceptor
  )
  .addErrorHandlers( 
    ErrorHandler
  ).withCustomUserAgent('apl-dds/v1')
  .lambda();
