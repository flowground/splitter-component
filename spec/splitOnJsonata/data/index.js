module.exports = {
    'should split array from an array constructor expression': require('./arrayConstructors.json'),
    'should split array of arrays of objects users.friends': require('./arrayOfArraysOfObjects.json'),
    'should emit error for array of primitives': require('./arrayOfArraysOfPrimitives.json'),
    'should emit error for array of primitives usernames': require('./arrayOfPrimitives.json'),
    'should emit only "end" with empty array usernames': require('./nothingToSplit.json'),
    'should split array from an object constructor expression': require('./objectConstructors.json'),
    'should emit error for non-array object': require('./objectValue.json'),
    'should emit error for non-array primitive': require('./primitiveValue.json'),
    'should split array from a range query expression': require('./objectConstructors.json'),
    'should split root array': require('./rootArray.json'),
    'should split array of arrays': require('./splitArrayOfArrays.json'),
    'should split array of objects users': require('./splitArrayOfObjects.json'),
};
