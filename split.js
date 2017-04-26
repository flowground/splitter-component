'use strict';
const debug = require('debug')('splitter');
const _ = require('lodash');
const messages = require('elasticio-node').messages;

/**
 * Returns missing property if splitting has it but object doesn't
 * Returns undefined if all properties in splitting are valid
 * @param body is plain object
 * @param splitting is a string representing a splitting expression
 * @returns {String|undefined}
 */
function findMissingProperty(body, splitting) {

    const path = splitting.split('.');

    let result = body;
    let i = 0;

    let property;
    let array = false;
    while (i < path.length && result) {
        property = path[i];

        if (_.isArray(result)) {
            array = path[i - 1];
            result = result[0][property];
        } else if (_.isPlainObject(result)) {
            result = result[property];
        } else {
            break;
        }

        if (result && !_.isArray(result)) {
            debug(`"${property}" property in the splitting expression is not an array. Returning the original object`);
        }

        if (_.isArray(result) && array) {
            return `The splitting expression "${splitting}": found array "${property}" but already has one "${array}"!`;
        }

        i++;
    }

    if (!result) {
        return `The splitting expression "${splitting}": the property "${property}" doesn't exist!`;
    }
}


/** @this processAction */
function processAction(msg, conf) {
    const splitting = conf.splitter || {};
    let body = msg.body || {};

    debug('Received new message with body: %j', body);
    debug('Config: %j', conf);

    const error = findMissingProperty(body, splitting);

    if (error) {
        this.emit('error', new Error(error));
        return;
    }

    const split = _.get(body, splitting);

    const result = [];

    if (_.isArray(split)) {
        split.forEach(elem => result.push(elem));
    } else {
        result.push(split);
    }

    result.forEach((elem) => {
        this.emit('data', messages.newMessageWithBody(elem));
    });
    this.emit('end');
}
exports.process = processAction;
exports._findMissingProperty = findMissingProperty;
