'use strict';

const debug = require('debug')('splitter');
const _ = require('lodash');
const { JsonataTransform } = require('@elastic.io/component-commons-library');
const messages = require('elasticio-node').messages;

/**
 * @this processAction
 */
async function processAction(msg, cfg) {
    const split = JsonataTransform.jsonataTransform(msg, cfg);

    if (!Array.isArray(split)) {
        await this.emit('error', new Error('The evaluated expression must be an array.'));
        return;
    }

    if (_.find(split, elem => !_.isObject(elem))) {
        await this.emit('error', new Error('Splitting arrays of objects only!'));
        return;
    }

    const results = [];
    split.forEach(elem => results.push(elem));
    debug('%s parts to emit found', results.length);
    for (let value of results) {
        if (value) {
            await this.emit('data', messages.newMessageWithBody(value));
        }
    }
    await this.emit('end');
}

exports.process = processAction;
