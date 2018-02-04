const bcrypt = require("bcrypt");
const uuidv5 = require('uuid/v5');

module.exports = {

    /**
     * generates random string of characters i.e salt
     * @function
     * @param {number} length - Length of the random string.
     */
    generateSalt: function(length) {
        return bcrypt.genSaltSync(length || CONFIG.get('encryptSaltLength') || 10);
    },

    /**
     * Generate Unique Hash
     */
    generateHash: function(key) {
        return uuidv5(key, uuidv5.URL);
    },

    /**
     * hash password with sha512.
     * @function
     * @param {string} value - List of required fields.
     * @param {string} salt - Data to be validated.
     */
    generatePasswordHash: function(value, salt) {
        return new Promise((resolve, reject) => {
            try {
                salt = salt || SYSTEM.generateSalt();
                bcrypt.hash(value, salt).then(function(hash) {
                    resolve(hash);
                });
            } catch (err) {
                reject(err);
            }
        });
    },

    encryptPassword: function(document) {
        return new Promise((resolve, reject) => {
            SYSTEM.generatePasswordHash(document.password).then(hash => {
                document.password = hash;
                resolve(document);
            }).catch(error => {
                reject(err);
            });
        });
    },

    compareHash: function(value, hash) {
        return new Promise((resolve, reject) => {
            try {
                bcrypt.compare(value, hash).then(function(match) {
                    resolve(match);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

};