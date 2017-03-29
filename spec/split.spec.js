'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');

describe('Splitter ', () => {

    let splitter = require('../split.js');
    let self;

    beforeEach(() => {
        self = {
            emit: sinon.spy()
        };
    });

    let data = require('./data');
    for (const key of Object.keys(data)) {
        it(key, () => {
            const { message, config, results } = data[key];
            splitter.process.call(self, message, config);
            expect(self.emit.callCount).to.equal(results.length);
            for (let i = 0; i < results.length - 1; i += 2) {
                expect(self.emit.getCall(i).args[0]).to.equal(results[i][0]);
                expect(self.emit.getCall(i).args[1].body).to.deep.equal(results[i][1]);
            }
            let last = results.length - 1;
            expect(self.emit.getCall(last).args[0]).to.equal(results[last][0]);
            if (results[last][1]) {
                expect(self.emit.getCall(last).args[1]).to.equal(results[last][1]);
            }
        });
    }
});
