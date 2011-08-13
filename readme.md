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

Documentation
-------------

### Events

#### Online 
event where emits when successfully connected 

	xmpp.on('online', function() {
		console.log('Yes, I\'m online');
	});

#### Chat
event where emits when somebody sends a chat message to you

	xmpp.on('chat', function(from, message) {
		console.log('%s says %s', from, message);
	});

#### Buddy
event where emits when state of the buddy on your chat list changes

	/**
		@param jid - is the id of buddy (eg:- hello@gmail.com)
		@param state - state of the buddy. value will be one of the following constant can be access via require('simple-xmpp').STATUS
			AWAY - Buddy goes away
		    DND - Buddy set its status as "Do Not Disturb" or  "Busy",
		    ONLINE - Buddy comes online or available to chat
		    OFFLINE - Buddy goes offline
	*/
	xmpp.on('buddy', function(jid, state) {
		console.log('%s is in %s state', jid, state);
	});

### Methods

#### Send
Send Chat Messages
*Params*

* to - Address to send (eg:- abc@gmail.com) 
* message - message to be sent 

	xmpp.send(to, message);

#### Probe
Probe the state of the buddy
*Params*

* jid - Buddy's id (eg:- abc@gmail.com)
	
* Callback Params*

* state - State of the buddy.  value will be one of the following constant can be access via require('simple-xmpp').STATUS
			AWAY - Buddy goes away
		    DND - Buddy set its status as "Do Not Disturb" or  "Busy",
		    ONLINE - Buddy comes online or available to chat
		    OFFLINE - Buddy goes offline
		    
	xmpp.probe(jid, function(state) {
		
	})

	


