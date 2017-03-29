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
            const { messages, errors } = results;
            splitter.process.call(self, message, config);
            if (messages) {
                expect(self.emit.callCount).to.equal(messages.length);
                for (let i = 0; i < messages.length; i++) {
                    expect(self.emit.getCall(i).args[0]).to.equal(messages[i][0]);
                    if (messages[i][1]) {
                        expect(self.emit.getCall(i).args[1].body).to.deep.equal(messages[i][1]);
                    }
                }
            }
            if (errors) {
                expect(self.emit.callCount).to.equal(errors.length);
                for (let i = 0; i < errors.length; i++) {
                    expect(self.emit.getCall(i).args[0]).to.equal(errors[i][0]);
                    expect(self.emit.getCall(i).args[1]).to.equal(errors[i][1]);
                }
            }
        });
    }
});
