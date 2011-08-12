Node Simple XMPP
================
Simple High Level NodeJS XMPP Library

Status
------
Alpha - Should not be used in production

Dependencies
------------
	sudo apt-get install libexpat1 libexpat1-dev libicu-dev

Install
-------
	npm install simple-xmpp

Example
-------
	var xmpp = require('simple-xmpp');

	xmpp.on('online', function() {
		console.log('Yes, I\'m connected!');
	});

	xmpp.on('chat', function(from, message) {
		xmpp.send(from, 'echo: ' + message);
	});

	xmpp.on('error', function(err) {
		console.error(err);
	});

	xmpp.connect({
	    jid         : username@gmail.com,
	    password    : password,
	    host        : 'talk.google.com',
	    port        : 5222
	});

