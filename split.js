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

/**
 * Reads a property of the object based on
 * path up to the index
 *
 * @param obj a hash e.g { foo : { bar : 'hasi' } }
 * @param path an array e.g ['foo','bar']
 * @return 'hasi'
 */
function get(obj, path) {
    let index = 0;
    let result = obj;
    if (typeof path === 'string') {
        path = path.split('.');
    }
    // If empty path
    if (path.length === 0) {
        return obj;
    }
    while (index < path.length && result) {
        result = result[path[index]];
        index++;
    }
    return result;
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
 * Function that set a value for given path
 *
 * @param obj Value e.g. { foo : { bar : 'hasi' } }
 * @param path Path e.g. ['foo','bar']
 * @param value e.g. 'Horst' so that obj will be after { foo : { bar : 'Horst' } }
 * @returns true if value was set
 */
function set(obj, path, value) {
    if (typeof path === 'string') {
        path = path.split('.');
    }
    if (path.length === 0) {
        return null;
    }
    let key = _.last(path);
    let parentPath = path.slice(0, path.length - 1);
    let parent = get(obj, parentPath);
    if (!parent) {
        // value we are trying to set to does not exists
        return false;
    } else if (_.isObject(parent)) {
        parent[key] = value;
        return true;
    }
    // Parent value is not an object
    return false;
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
    let array = get(root, currentPath);
    if (!array) {
        // Can't find next value along the path
        // will just return latest value
        return root;
    } else if (!Array.isArray(array)) {
        // Apparently next value along the path
        // is not an array, so we just going one
        // step further along the path
        return doSplit(path, root, index + 1);
    } else {
        let results = [];
        // We have a value and it's an Array
        array.forEach((arrayValue) => {
            // Clone root
            let result = clone(root);
            // Replace array with one of it's values
            set(result, currentPath, clone(arrayValue));
            // Do next iteration and store results
            let nextResult = doSplit(path, result, index + 1);
            if (nextResult) {
                results = results.concat(nextResult);
            }
        });
        return results;
    }
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
    let results = [];
    loopPath = cutByMaxSplittingLevel(loopPath, splittingLevel);
    let res = doSplit(loopPath, message);
    res.forEach((root) => {
        results = results.concat(doSplit(loopPath, root));
    });
    return results;
}


function checkSplitting(body, splitting, splittingLevel) {
    let path = splitting.split('.');
    path = cutByMaxSplittingLevel(path, splittingLevel);
    let result = body;
    let i = 0;
    while (i < path.length && result) {
        if (_.isPlainObject(result) || _.isArray(result)) {
            if (_.isArray(result)) {
                result = result[0][path[i]];
            } else {
                result = result[path[i]];
            }
        } else {
            break;
        }
        i++;
    }
    return result;
}

function processAction(msg, conf) {
    const splitting = conf.splitter || {};
    let body = msg.body || {};

    debug('Received new message with body: %j', body);
    debug('Config: %j', conf);

    const splittingLevel = getSplittingLevel(splitting);
    const validSplitting = checkSplitting(body, splitting, splittingLevel);
    if (splittingLevel > 0 && isArrayKey(splitting)) {
        if (validSplitting) {
            body = splitMessage(body, splitting, splittingLevel);
            body.forEach((elem) => {
                this.emit('data',{
                    body: elem
                });
            });
            this.emit('end');
        } else {
            this.emit('error',
                `The given splitting expression "${splitting}" is invalid: there is no such property!`);
        }
    } else {
        this.emit('error', 'Splitting level must be bigger than 0');
    }
}
exports.process = processAction;
