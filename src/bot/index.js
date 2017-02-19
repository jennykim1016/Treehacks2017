/*
 * This is the actual logic behind the messages
 */
import * as wiki from './wiki';
import responses from './responses';

const defaultResponses = {
  // these are just some various responses you might want to send
  instructions: {
    type: 'template',
    payload: {
      template_type: 'button',
      text: "Get a random article!",
      buttons: [
        {
          type: 'postback',
          title: 'Press me!',
          payload: 'random'
        },
      ]
    }
  },
  greetingMessage: "Hello world!",
  invalidMessage: "Sorry, didn't understand that!",
  failure: "Sorry, something went wrong!",
  hereYouGo: "Here's a cool article",
  locationInstruction: {
    text: 'Please share your location.',
    quick_replies: [
      {
        "content_type":"location",
      }
    ]
  }
}

export const handleMessage = ({message, userKey}) => {
//    console.log('in handlemessage');
  return getResponsesForMessage({message, userKey})
  .then(messages => {
    return generateMessagesFromArray(messages, userKey);
  })
};

const generateMessagesFromArray = (messages, key) => {
  let msgs = [];

  messages.forEach(message => {
    msgs = msgs.concat(buildMessage(message, key));
  });

  return msgs;
};

const buildMessage = (message, key) => {
  if(typeof message === 'string') {
    return {
      text: message,
      key
    }
  } else if(typeof message === 'object') {
    return {
      attachment: message,
      key
    }
  }
};

const getResponsesForMessage = ({message, userKey}) => {
  return new Promise((resolve, reject) => {
    if(message.text === 'hi') {
      resolve([defaultResponses.greetingMessage, defaultResponses.instructions]);
    } else if(message.text === 'random') {
      wiki.getRandomWikiArticleLink()
        .then(link => {
          resolve([defaultResponses.hereYouGo, link]);
        }).catch(() => {
          resolve([defaultResponses.failure])
        })
    } else {
        
        var found = false;
        var positive= false;
        var stringReturn = "";
        var minDistance = 1000000;
        var levenshtein = require('fast-levenshtein');
        var emotional = require('emotional');
        
        emotional.load(function () {
            if(emotional.positive(message.text)){
                positive=true;
                // save into db
                console.log("SAVED INTO DB");
            }
            
            var initDistance = 0;
        for (var i = 0; i < responses.length; i++) {
            var distance = levenshtein.get(message.text, ""+responses[i][0], { useCollator: true});
            if(minDistance > distance){
                found=true;
                stringReturn = responses[i][1];
                minDistance = distance;
            }
        }
        if (!found) {
            resolve([defaultResponses.invalidMessage]);
        }
        if(positive){
            resolve(["I realized that your message is super positive :) I will save into my database. You can type 'Good_Memory' to see one of the saved positive, previous messages. ", stringReturn]);
        } {
            resolve([stringReturn]);
        }
        });
        
    } 
  });
};
