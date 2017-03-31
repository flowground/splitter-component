'use strict';
const expect = require('chai').expect;
const splitter = require('../split');
const findMissingProperty = require('./data/findMissingProperty');
const splitMessage = require('./data/splitMessage');

describe('Splitter', () => {

    describe('getSplittingLevel', () => {

        it('should return 2 to users[*].friends[*]', () => {
            expect(splitter._getSplittingLevel('users[*].friends[*]')).to.equal(2);
        });

        it('should return 1 to users[*]', () => {
            expect(splitter._getSplittingLevel('users[*]')).to.equal(1);
        });

        it('should return undefined to users', () => {
            expect(splitter._getSplittingLevel('users')).to.equal(0);
        });

    });

    describe('cutByMaxSplittingValue', () => {

        it('should return "[ users, friends ]" to users[*].name', () => {
            expect(splitter._cutByMaxSplittingValue(['users[*]','name'], 1))
                .to.deep.equal(['users','name']);
        });

        it('should return "[ users, friends ]" to users[*].friends[*].name', () => {
            expect(splitter._cutByMaxSplittingValue(['users[*]','friends[*]','name'], 2))
                .to.deep.equal(['users','friends', 'name']);
        });

    });

    describe('findMissingProperty', () => {

        for (const key of Object.keys(findMissingProperty)) {
            it(key, () => {
                const { body, result: expectedResult, splitting, splittingLevel }
                = findMissingProperty[key];

                expect(splitter._findMissingProperty(body, splitting, splittingLevel))
                    .to.equal(expectedResult);
            });
        }

    });

    describe('splitMessage', () => {

        for (const key of Object.keys(splitMessage)) {
            it(key, () => {
                const { body, splitting, results: expectedResults, splittingLevel } = splitMessage[key];

                let actualResults = splitter._splitMessage(body, splitting, splittingLevel);

                expect(actualResults).to.have.lengthOf(expectedResults.length);

                for (let i = 0; i < expectedResults.length; i++) {
                    expect(actualResults[i]).to.deep.equal(expectedResults[i]);
                }
            });
        }

    });

});
