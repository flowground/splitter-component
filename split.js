'use strict';
const debug = require('debug')('splitter');
const _ = require('lodash');
const MANY = '[*]';

/* Returns count of splits
 * For example if input is {property: "v1[*].v15[*].v2"} returns 2
 * @return Number
 */
function getSplittingLevel(splitting) {
    let depth = 0;
    let arrays = splitting.match(/\[\*\]/g);

    if (!arrays) {
        return;
    }

    if (arrays.length > depth) {
        depth = arrays.length;
    }
    return depth;
}

function isArrayKey(key) {
    return typeof key !== 'number' && key.indexOf(MANY) > 0;
}

function toSingleKey(key) {
    return key.substr(0, key.lastIndexOf(MANY));
}

/**
 * Special clone function that do the deep clone of the data
 * NOTE: all functions that were part of the object data will be lost
 *
 * @param a
 * @returns {*}
 */
function clone(a) {
    return JSON.parse(JSON.stringify(a));
}

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
    let currentPath = path.slice(0, index + 1);
    // Getting value on the path
    let array = _.get(root, currentPath.join('.'));
    if (!array) {
        // Can't find next value along the path
        // will just return latest value
        return root;
    }

    if (!Array.isArray(array)) {
        // Apparently next value along the path
        // is not an array, so we just going one
        // step further along the path
        return doSplit(path, root, index + 1);
    }

    let results = [];
    // We have a value and it's an Array
    array.forEach((arrayValue) => {
        // Clone root
        let result = clone(root);
        // Replace array with one of it's values
        _.set(result, currentPath, clone(arrayValue));
        // Do next iteration and store results
        let nextResult = doSplit(path, result, index + 1);
        if (nextResult) {
            results = results.concat(nextResult);
        }
    });

    return results;
}

function cutByMaxSplittingLevel(path, splittingLevel) {
    let counter = 0;
    let result = [];

    path.forEach((node) => {
        if (isArrayKey(node)) {
            counter++;
            if (counter <= splittingLevel) {
                result.push(toSingleKey(node));
            }
        } else {
            result.push(node);
        }
    });

    return result;
}

function splitMessage(message, splitting, splittingLevel) {
    let loopPath = splitting.split('.');
    loopPath = cutByMaxSplittingLevel(loopPath, splittingLevel);

    let results = [];
    let res = doSplit(loopPath, message);

    res.forEach((root) => {
        results = results.concat(doSplit(loopPath, root));
    });

    return results;
}


function checkSplitting(body, splitting, splittingLevel) {
    const pathChunks = splitting.split('.');
    const path = cutByMaxSplittingLevel(pathChunks, splittingLevel);

    let result = body;
    let i = 0;

    while (i < path.length && result) {
        if (_.isArray(result)) {
            result = result[0][path[i]];
        } else if (_.isPlainObject(result)) {
            result = result[path[i]];
        } else {
            break;
        }
        i++;
    }

    let property = (i === path.length) ? path[i - 1] : path[i];

    return {
        validSplitting: result,
        property
    };
}

/** @this processAction */
function processAction(msg, conf) {
    const splitting = conf.splitter || {};
    let body = msg.body || {};

    debug('Received new message with body: %j', body);
    debug('Config: %j', conf);

    const splittingLevel = getSplittingLevel(splitting);
    const { validSplitting, property } = checkSplitting(body, splitting, splittingLevel);

    if (splittingLevel <= 0 || !isArrayKey(splitting)) {
        this.emit('error', new Error(
            `The splitting expression "${splitting}" should contain at least one "[*]"`
        ));
        return;
    }

    if (!validSplitting) {
        this.emit('error', new Error(
            `The splitting expression "${splitting}": the property "${property}" doesn't exist!`
        ));
        return;
    }

    body = splitMessage(body, splitting, splittingLevel);
    body.forEach((elem) => {
        this.emit('data',{
            body: elem
        });
    });
    this.emit('end');
}
exports.process = processAction;
