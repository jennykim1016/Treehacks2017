/*
 * This is the actual logic behind the messages
 */
import * as wiki from './wiki';
import responses from './responses';
import * as firebase from '../firebase/firebase';

var watson = require('watson-developer-cloud');

var tone_analyzer = watson.tone_analyzer({
  username: '0f6c2032-8659-4f0b-ac0f-4d5e924a7e99',
  password: 'qD2lx6807Qjm',
  version: 'v3',
  version_date: '2016-05-19'
});

const defaultResponses = {
  // these are just some various responses you might want to send
  instructions: {
    type: 'template',
    payload: {
      template_type: 'button',
      text: "Remind yourself of a good memory.",
      buttons: [
        {
          type: 'postback',
          title: 'Press me!',
          payload: 'good memory'
        },
      ]
    }
  },
  greetingMessage: "Hello there!",
  invalidMessage: "Sorry, didn't understand that!",
  failure: "Sorry, something went wrong!",
  hereYouGo: "Here's a cool article",
  receivedGratitude: "Have a great day!",
  gratitude: "Here's a good memory to remember!",
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
    /*tone_analyzer.tone({ text: 'A word is dead when it is said, some say. Emily Dickinson' },
      function(err, tone) {
      if (err)
        console.log(err);
      else
        console.log(JSON.stringify(tone, null, 2));
    });*/
    if(message.text === 'hi' || message.text === 'help') {
      resolve([defaultResponses.greetingMessage, defaultResponses.instructions]);
    } else if(message.text === 'random') {
      wiki.getRandomWikiArticleLink()
        .then(link => {
          resolve([defaultResponses.hereYouGo, link]);
        }).catch(() => {
          resolve([defaultResponses.failure])
        })
    } else if (message.text === 'good memory') {
        firebase.returnEntry()
        .then(text => {
            resolve([defaultResponses.gratitude, text]);
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
                firebase.addToDb(message.text)
                .then(() => {
                    resolve(defaultResponses.receivedGratitude);
                }).catch(() => {
                    resolve([defaultResponses.failure])
                })
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
                resolve(["I realize that your message is super positive :) I will save this into my database. You can type 'good memory' to be reminded of a positive message from your past! ", stringReturn]);
            } {
                resolve([stringReturn]);
            }
        });
    }
  });
};