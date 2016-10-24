import Ember from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from './template';
import {validator, buildValidations} from 'ember-cp-validations';
import config from 'ember-get-config';


function range(start, stop) {
  var options = [];
  for (var i=start; i <= stop; i++) {
    options.push(i);
  }
  return options;
}

var generateValidators = function(questions) {
  var validators = {};
  var presence = validator('presence', {
    presence:true,
    message: 'This field is required'
  });
  for (var q=0; q < questions.length; q++) {
    var isOptional = 'optional' in questions[q] && questions[q]['optional'];
    if (!isOptional) {
      var key = 'questions.' + q + '.value';
      validators[key] = presence;
    }
  }
  return validators;
};


const questions = [
  {
    question: 'survey.sections.1.questions.1.label',
    keyName: 'Age',
    type: 'select',
    scale: range(16, 100),
    value: null
  },
  {
    question: 'survey.sections.1.questions.2.label',
    keyName: 'Gender',
    type: 'select',
    scale: ['survey.sections.1.questions.2.options.male',
        'survey.sections.1.questions.2.options.female',
        'survey.sections.1.questions.2.options.other',
        'survey.sections.1.questions.2.options.na'
    ],
    value: null
  },
  {
    question: 'survey.sections.1.questions.3.label',
    keyName: 'Ethnicity',
    type: 'input',
    value: null
  },
  {
    question: 'survey.sections.1.questions.4.label',
    keyName: 'Language',
    type: 'input',
    value: null
  },
  {
    question: 'survey.sections.1.questions.5.label',
    keyName: 'SocialStatus',
    type: 'radio',
    scale: range(1, 10),
    labelTop: false,
    formatLabel: 'negative-margin-top narrow-width',
    value: null,
    labels: [
        {
            rating: 1,
            label: 'survey.sections.1.questions.5.options.least'
        },
        {
            rating: 5,
            label: 'survey.sections.1.questions.5.options.average',
            formatClass: 'format-average-label'
        },
        {
            rating: 10,
            label: 'survey.sections.1.questions.5.options.most'
        }
    ]
  },
  {
    question: 'survey.sections.1.questions.6.label',
    keyName: 'BirthCity',
    type: 'input',
    value: null
  },
  {
    question: 'survey.sections.1.questions.11.label',
    keyName: 'BirthCountry',
    type: 'input',
    value: null
  },
  {
    question: 'survey.sections.1.questions.7.label',
    keyName: 'Residence',
    type: 'select',
    scale: [
        'survey.sections.1.questions.7.options.remoteRural',
        'survey.sections.1.questions.7.options.rural',
        'survey.sections.1.questions.7.options.suburban',
        'survey.sections.1.questions.7.options.urban'
    ],
    value: null
  },
  {
    question: 'survey.sections.1.questions.8.label',
    keyName: 'ReligionScale',
    type: 'radio',
    scale: range(1, 11),
    hiddenOptions: [11],
    labelTop: false,
    formatLabel: 'negative-margin-top narrow-width',
    value: null,
    labels: [
        {
            rating: 1,
            label: 'survey.sections.1.questions.8.options.notReligious'
        },
        {
            rating: 10,
            label: 'survey.sections.1.questions.8.options.highlyReligious'
        },
        {
            rating: 11,
            label: 'survey.sections.1.questions.8.options.preferNoAnswer'
        }
    ]
  },
  {
    question: 'survey.sections.1.questions.9.label',
    keyName: 'ReligionYesNo',
    type: 'radio',
    scale: ['global.yesLabel', 'global.noLabel'],
    labelTop: true,
    value: null
  },
  {
    question: 'survey.sections.1.questions.10.label',
    keyName: 'ReligionFollow',
    type: 'input',
    optional: true,
    value: null
  }];

const Validations = buildValidations(generateValidators(questions));


export default ExpFrameBaseComponent.extend(Validations, {
    type: 'exp-overview',
    layout: layout,
    questions: questions,

    showOptional: Ember.computed('questions.9.value', function() {
       return this.questions[9].value === 'yesLabel';
    }),
    responses: Ember.computed(function() {
        var questions = this.get('questions');
        var responses = {};
        for (var i=0; i < questions.length; i++) {
            var keyName = questions[i].keyName;
            if (i === 0) {
                // Convert value to int bc select-input returns a string (e.g. "16" --> 16)
                responses[keyName] = parseInt(questions[i].value);
            } else {
                responses[keyName] = questions[i].value;
            }
        }
        return responses;
    }).volatile(),
    allowNext: Ember.computed('validations.isValid', function() {
        if (config.featureFlags.validate) {
            return this.get('validations.isValid');
        }
        return true;
    }),
    meta: {
        name: 'ExpOverview',
            description: 'TODO: a description of this frame goes here.',
            parameters: {
                type: 'object',
                    properties: {
                        // define parameters here
                    }
            },
        data: {
                type: 'object',
                properties: {
                    responses: {
                        // TODO: Specify *required* properties in future according to Json-schema syntax
                        //   https://spacetelescope.github.io/understanding-json-schema/reference/object.html#required-properties
                        type: 'object',
                        properties: {
                            'Age': {
                                type: 'integer'
                            },
                            'Gender': {
                                type: 'string'
                            },
                            'Ethnicity': {
                                type: 'string'
                            },
                            'Language': {
                               type: 'string'
                            },
                            'SocialStatus': {
                                type: 'integer'
                            },
                            'BirthCity': {
                                type: 'string'
                            },
                            'BirthCountry': {
                                type: 'string'
                            },
                            'Residence': {
                               type: 'string'
                            },
                            'ReligionScale': { // how religious?
                                type: 'integer'
                            },
                            'ReligionYesNo': { // follows religion?
                                type: 'string'
                            },
                            'ReligionFollow': {  // which religion?
                                type: 'string'
                            }
                        }
                    }
                }
            }
    },
    actions: {
      continue() {
        if (this.get('allowNext')) {
          this.send('next');
        }
      }
    },
    loadData: function(frameData) {
        for (var q=0; q < this.get('questions').length; q++) {
            var keyName = this.get('questions')[q].keyName;
            this.get('questions')[q].value = frameData.responses[keyName];
        }
    }
});
