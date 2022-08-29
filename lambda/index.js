/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const moment = require('moment-timezone');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    /*handle(handlerInput) {
        const speakOutput = 'Welcome to cycle time2, you can say Hello or Help. Which would you like to try?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }*/
    handle(handlerInput) {
        const cfunctions = require('./model.js');
        cfunctions.readData(handlerInput);
        
        
        const speakOutput = 'Welcome to Shamrans Prayer Time Test2.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const PrayerTimeIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'PrayerTimeIntent'
            // handlerInput.requestEnvelope.request.type === 'IntentRequest'
            //     && handlerInput.requestEnvelope.request.intent.name === 'PrayerTimeIntent'
        );
    },
    handle(handlerInput) {
        const cfunctions = require('./model.js');
        var prayer = handlerInput.requestEnvelope.request.intent.slots.prayer.value;
        console.log("prayer heared value is : "+prayer);
        
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
         if (!sessionAttributes.hasOwnProperty('prayer_list')){
             var yy = 'hmm... array has no value';
             
             if(sessionAttributes.hasOwnProperty('prayer_list_status') && !sessionAttributes.prayer_list_status){
                 yy = 'Incorrect month!! Please update the prayer time!';
             }
             
             return handlerInput.responseBuilder
            .speak(yy)
            // .reprompt(yy)
            .getResponse();
         }
         console.log('array value:',sessionAttributes.prayer_list);
         
         const prayerTime = cfunctions.getPrayerTime(prayer, sessionAttributes.prayer_list);
         console.log('item value:',prayerTime);
         
         var speakOutput = `Sorry, I could not understand you!! Did you say ${prayer}?`;
         
         if(prayerTime !== null){
             // uncomment this if the prayer table time is not with PM or AMnotation.
             
             /*const getPrayerTime12hr = cfunctions.getPrayerTimeTo12hr(prayerTime);
             console.log('item value in 12hr:',getPrayerTime12hr);*/
             
             const getPrayerTime12hr = prayerTime;
             
             speakOutput = `The prayer time for ${prayer} is ${getPrayerTime12hr}. Do you want to set a reminder for your next prayer?`;
             
             return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(true)
            .reprompt(speakOutput)
            .getResponse();
         } else {
            return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();   
         }
    }
};

const AllPrayerTimeIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'AllPrayerTimeIntent'
        );
    },
    handle(handlerInput) {
        const cfunctions = require('./model.js');
        
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
         if (!sessionAttributes.hasOwnProperty('prayer_list')){
             var yy = 'hmm... array has no value';
             
             if(sessionAttributes.hasOwnProperty('prayer_list_status') && !sessionAttributes.prayer_list_status){
                 yy = 'Incorrect month!! Please update the prayer time!';
             }
             
             return handlerInput.responseBuilder
            .speak(yy)
            .withShouldEndSession(true)
            //.reprompt(yy)
            .getResponse();
         }
         console.log('array value:',sessionAttributes.prayer_list);
         
         var speakOutput = `Your prayer time for today  follows...
         Subah is at ${sessionAttributes.prayer_list[2]}.
         Sun Rise is at ${sessionAttributes.prayer_list[4]}.
         Zuhar is at ${sessionAttributes.prayer_list[5]}.
         Asar is at ${sessionAttributes.prayer_list[7]}.
         Maghrib is at ${sessionAttributes.prayer_list[9]}.
         Isha is at ${sessionAttributes.prayer_list[11]}.
         That's all!!`;
         
        
         return handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt(speakOutput)
        .getResponse();
    }
};


const CreateReminderIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent'
        /*return handlerInput.requestEnvelope.request.type === 'IntentRequest'
                && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'*/
    },
    /*handle(handlerInput) {
        const yy = "oo Im inside yes intent handlet";
        return handlerInput.responseBuilder
            .speak(yy)
            .reprompt(yy)
            .getResponse();   
    }*/
    async handle(handlerInput) {
        const reminderAPiCLient = handlerInput.serviceClientFactory.getReminderManagementServiceClient()
        
        const { permissions } = handlerInput.requestEnvelope.context.System.user
        
        if(!permissions){
            return handlerInput.responseBuilder
            .speak("Please go to Alexa App and allow permission to set reminder!!")
            .withAskForPermissionsConsentCard(['alexa::alerts:reminders:skill:readwrite'])
            .getResponse();    
        }
        
        const currentDateTime = moment().tz('Europe/London');
        const req = {
           requestTime: currentDateTime.format('YYYY-MM-DDTHH:mm:ss'),
           trigger: {
                type : "SCHEDULED_ABSOLUTE",
                scheduledTime: currentDateTime.add(15,'seconds').format('YYYY-MM-DDTHH:mm:ss'),
                timeZoneId: 'Europe/London',
                recurrence: {
                    freq: 'DAILY' 
                }
           },
           alertInfo: {
                spokenInfo: {
                    content: [{
                        locale: "en-UK",
                        text: "Zuhar prayer time alert!"
                    }]
                }
            },
            pushNotification : {                            
                 status : "ENABLED"         
            }
        }
        
        try{
            await reminderAPiCLient.createReminder(req);    
        }
        catch(error){
            console.log(`-----  Error ${error} ----`);
            return handlerInput.responseBuilder
            .speak("There was a problem in creating your reminder. Please try again lator.") 
            .getResponse();
        }
        
        const speakOutput = 'I have set the reminder for you!!'; // Add specific message to say which prayer time it is.

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        PrayerTimeIntentHandler,
        AllPrayerTimeIntentHandler,
        CreateReminderIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withApiClient(new Alexa.DefaultApiClient())
    // .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();