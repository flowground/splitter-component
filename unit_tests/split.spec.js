'use strict';
const expect = require('chai').expect;
const splitter = require('../split');
const findMissingProperty = require('./data/findMissingProperty');
const splitMessage = require('./data/splitMessage');

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

    describe('splitMessage', () => {

        for (const key of Object.keys(splitMessage)) {
            it(key, () => {
                const { body, splitting, results: expectedResults } = splitMessage[key];

                let actualResults = splitter._splitMessage(body, splitting);

                expect(actualResults).to.have.lengthOf(expectedResults.length);

                for (let i = 0; i < expectedResults.length; i++) {
                    expect(actualResults[i]).to.deep.equal(expectedResults[i]);
                }
            });
        }

    });

});
