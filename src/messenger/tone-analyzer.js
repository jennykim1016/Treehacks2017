import request from 'request-promise';
import _ from 'lodash';

var watson = require('watson-developer-cloud');

var tone_analyzer = watson.tone_analyzer({
  username: '0f6c2032-8659-4f0b-ac0f-4d5e924a7e99',
  password: 'qD2lx6807Qjm',
  version: 'v3',
  version_date: '2016-05-19'
});

tone_analyzer.tone({ text: 'A word is dead when it is said, some say. Emily Dickinson' },
  function(err, tone) {
    if (err)
      console.log(err);
    else
      console.log(JSON.stringify(tone, null, 2));
});