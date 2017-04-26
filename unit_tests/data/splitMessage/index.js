'use strict';

module.exports = {
    'should split message with splitting expr users': require('./1.json'),
    'should split message with splitting expr users.friends': require('./2.json'),
    'should split message with splitting expr users.friends.name': require('./2-1.json'),
    'should split message with splitting expr users.profile.friends': require('./3.json')
};
