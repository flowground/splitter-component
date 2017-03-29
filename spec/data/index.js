'use strict';

module.exports = {
    'should split array of objects users[*]': require('./splitArrayOfObjects.json'),
    'should split array of arrays users[*].friends[*]': require('./splitArrayOfArrays.json'),
    'should split array of arrays of objects users[*].friends[*]': require('./arrayOfArraysOfObjects.json'),
    'should split array of arrays of primitives userNames[*]': require('./arrayOfArraysOfPrimitives.json'),
    'should emit only "end" with empty array userNames[*]': require('./nothingToSplit.json'),
    'should emit error no such property users[*].emails[*]': require('./noSuchPropertySplitting.json'),
    'should emit error no [*] was in splitting expression': require('./splittingLvlLessThanZero.json'),
    'should emit array of primitives userNames[*]': require('./arrayOfPrimitives.json')
};
