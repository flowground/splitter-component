'use strict';
const expect = require('chai').expect;
const splitter = require('../split');
const findMissingProperty = require('./data/findMissingProperty');

describe('Splitter', () => {

    describe('findMissingProperty', () => {

        for (const key of Object.keys(findMissingProperty)) {
            it(key, () => {
                const { body, result: expectedResult, splitting }
                = findMissingProperty[key];

                expect(splitter._findMissingProperty(body, splitting))
                    .to.equal(expectedResult);
            });
        }

    });

});
