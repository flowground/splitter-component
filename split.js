'use strict';
const debug = require('debug')('splitter');
const _ = require('lodash');
const messages = require('elasticio-node').messages;

/**
 * This function will do the multiplication of the values
 * along the given path.
 *
 * @param path an array of values ['commits','files','file']
 * @param root a source object
 * @param index an optional variable used internally for recursion, if absent will be set to 0
 * @returns {*} an array of value cloned (multiplied) along the path so that all arrays along the path are replaced with
 *  simple values
 */
function doSplit(path, root, index) {
    // default index is 0
    index = index || 0;
    // End of recursion?
    if (index === path.length) {
        return [root];
    }

    // Resulting array
    let currentPath = path[index];
    // Getting value on the path
    let array = root[currentPath];
    if (!array) {
        // Can't find next value along the path
        // will just return latest value
        return root;
    }

    if (!Array.isArray(array)) {
        // Apparently next value along the path
        // is not an array, so we just going one
        // step further along the path
        return doSplit(path, array, index + 1);
    }

    let results = [];
    // We have a value and it's an Array
    array.forEach((arrayValue) => {

        let result = arrayValue;

        if (index < path.length) {

            result = doSplit(path, result, index + 1);

        }

        results = results.concat(result);

    });

    return results;
}

function splitMessage(message, splitting) {

    let loopPath = splitting.split('.');


    let results = [];
    let res = doSplit(loopPath, message);

    res.forEach((root) => {
        results = results.concat(doSplit(loopPath, root));
    });

    return results;
}

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
    while (i < path.length && result) {
        property = path[i];
        if (_.isArray(result)) {
            result = result[0][property];
        } else if (_.isPlainObject(result)) {
            result = result[property];
        } else {
            break;
        }

        if (result && !_.isArray(result)) {
            debug(`"${property}" property in the splitting expression is not an array. Returning the original object`);
        }

        i++;
    }

    if (!result) {
        return property;
    }
}

/** @this processAction */
function processAction(msg, conf) {
    const splitting = conf.splitter || {};
    let body = msg.body || {};

    debug('Received new message with body: %j', body);
    debug('Config: %j', conf);

    const property = findMissingProperty(body, splitting);

    if (property) {
        this.emit('error', new Error(
            `The splitting expression "${splitting}": the property "${property}" doesn't exist!`
        ));
        return;
    }

    body = splitMessage(body, splitting);
    body.forEach((elem) => {
        this.emit('data', messages.newMessageWithBody(elem));
    });
    this.emit('end');
}
exports.process = processAction;
exports._findMissingProperty = findMissingProperty;
exports._splitMessage = splitMessage;
