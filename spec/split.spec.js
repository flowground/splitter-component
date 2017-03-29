'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');
const splitter = require('../split.js');
const data = require('./data');

describe('Splitter ', () => {
    let self;

    beforeEach(() => {
        self = {
            emit: sinon.spy()
        };
    });

    for (const key of Object.keys(data)) {
        it(key, () => {
            const { message, config, results } = data[key];
            splitter.process.call(self, message, config);
            expect(self.emit.callCount).to.equal(results.length);
            for (let i = 0; i < results.length; i++) {
                expect(self.emit.getCall(i).args[0]).to.equal(results[i][0]);
                if (typeof results[i][1] === 'object') {
                    expect(self.emit.getCall(i).args[1].body).to.deep.equal(results[i][1]);
                } else if (typeof results[i][1] === 'string') {
                    expect(self.emit.getCall(i).args[1]).to.equal(results[i][1]);
                }
            }
        });
    }
});
