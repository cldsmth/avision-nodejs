class PasswordHash {
	
	constructor() {
   		this.crypto = require('crypto');
   		/**
		 * generates random string of characters i.e salt
		 * @function
		 * @param {number} length - Length of the random string.
		 */
		this.genRandomString = function(length){
		    return this.crypto.randomBytes(Math.ceil(length/2))
		            .toString('hex') /** convert to hexadecimal format */
		            .slice(0,length);   /** return required number of characters */
		};
		/**
		 * hash password with sha512.
		 * @function
		 * @param {string} password - List of required fields.
		 * @param {string} salt - Data to be validated.
		 */
		this.sha512 = function(password, salt){
		    var hash = this.crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
		    hash.update(password);
		    var value = hash.digest('hex');
		    return {
		        salt: salt,
		        passwordHash: value
		    };
		};
  	}

  	saltHashPassword(userpassword) {
  		var salt = this.genRandomString(16); /** Gives us salt of length 16 */
	    var passwordData = this.sha512(userpassword, salt);
	    return {
	    	salt: passwordData.salt,
	    	password: passwordData.passwordHash
	    }
  	}

  	getHashPassword(userpassword, usersalt) {
  		var passwordData = this.sha512(userpassword, usersalt);
  		return passwordData.passwordHash;
  	}

};

module.exports = PasswordHash;