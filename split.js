'use strict';
const debug = require('debug')('splitter');
const _ = require('lodash');
const messages = require('elasticio-node').messages;

/** @this processAction */
function processAction(msg, conf) {
    const splitting = conf.splitter || {};
    let body = msg.body || {};

    debug('Received new message with body: %j', body);
    debug('Config: %j', conf);

    const split = _.get(body, splitting);

    if (!split) {
        this.emit('error', new Error(`Could not find properties by following path: "${splitting}"!`));
        return;
    }

    const result = [];

    if (_.isArray(split)) {
        split.forEach(elem => result.push(elem));
    } else if (_.isObject(split)) {
        result.push(split);
    } else {
        result.push({
            value: split
        });
    }

    result.forEach(elem => {
        const body = _.isObject(elem) ? elem : {
            value: elem
        };
        this.emit('data', messages.newMessageWithBody(body));
    });
    this.emit('end');
}
exports.process = processAction;
