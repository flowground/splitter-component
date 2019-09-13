'use strict';

module.exports = {
    'should split array of objects users': require('./splitArrayOfObjects.json'),
    'should split array of arrays users.friends': require('./splitArrayOfArrays.json'),
    'should split array of arrays of objects users.friends': require('./arrayOfArraysOfObjects.json'),
    'should split array of arrays of primitives userNames': require('./arrayOfArraysOfPrimitives.json'),
    'should split root array': require('./rootArray.json'),
    'should emit only "end" with empty array userNames': require('./nothingToSplit.json'),
    'should emit error no such property users.emails': require('./noSuchPropertySplitting.json'),
    'should emit error for array of primitives userNames': require('./arrayOfPrimitives.json'),
    'should emit error when users is primitive': require('./primitiveValue.json'),
    'should emit object when users is object': require('./objectValue.json')
};
