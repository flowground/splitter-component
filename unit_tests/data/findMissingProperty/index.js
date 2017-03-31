'use strict';

module.exports = {
    'should return "name" to users[*].surname': require('./missingSurnameProperty.json'),
    'should return "profiles" to users[*].profile.name': require('./missingMiddleProperty.json'),
    'should return "members" to users[*].profile.name': require('./missingFirstProperty.json'),
    'should return undefined to users[*].name': require('./allPropertiesAreValid.json')
};
