Node Simple XMPP
================
Simple High Level NodeJS XMPP Library

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

	xmpp.on('subscribe', function(from) {
	if (from === 'a.friend@gmail.com') {
		xmpp.acceptSubscription(from);
		}
	});

	xmpp.connect({
	    jid         : username@gmail.com,
	    password    : password,
	    host        : 'talk.google.com',
	    port        : 5222
	});

	xmpp.subscribe('your.friend@gmail.com');
	// check for incoming subscription requests
	xmpp.getRoster();


Documentation
-------------

### Events

#### Online
event where emits when successfully connected

	xmpp.on('online', function() {
		console.log('Yes, I\'m online');
	});

#### Close
event where the connection has been closed

	xmpp.on('close', function() {
		console.log('connection has been closed!');
	});

#### Chat
event where emits when somebody sends a chat message to you

	xmpp.on('chat', function(from, message) {
		console.log('%s says %s', from, message);
	});

#### Group Chat
event where emits when somebody sends a group chat message to you

	xmpp.on('groupchat', function(conference, from, message, stamp) {
		console.log('%s says %s on %s on %s at %s', from, message, conference, stamp.substr(0,9), stamp.substr(10));
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
		@param statusText - status message of the buddy (known as "custom message" in Gmail). 
		                    `null` if the buddy has not specified any status text.
	*/
	xmpp.on('buddy', function(jid, state, statusText) {
		console.log('%s is in %s state - %s', jid, state, statusText);
	});

#### Stanza
access core stanza element when such received
Fires for every incoming stanza

	/**
		@param stanza - the core object
		xmpp.on('stanza', function(stanza) {
			console.log(stanza);
		});
	*/

### Methods

#### Send
Send Chat Messages

	/**
		@param to - Address to send (eg:- abc@gmail.com - room@conference.domain.tld)
		@param message - message to be sent
		@param group - if true, send the message in a group chat
	*/

	xmpp.send(to, message, group);

Send Friend requests

	/**
		@param to - Address to send (eg:- your.friend@gmail.com)
	*/
	xmpp.subscribe(to);

Accept Friend requests

	/**
		@param from - Address to accept (eg:- your.friend@gmail.com)
	*/
	xmpp.acceptSubscription(from);

Unsubscribe Friend

	/**
		@param to - Address to unsubscribe (eg:- no.longer.friend@gmail.com)
	*/
	xmpp.unsubscribe(to);

Accept unsubscription requests

	/**
		@param from - Address to accept (eg:- no.longer.friend@gmail.com)
	*/
	xmpp.acceptUnsubscription(from);

Set presence
	/**
		@param show - Your current presence state ['away', 'dnd', 'xa', 'chat']
 		@param status - (optional) free text as your status message
	*/
	xmpp.setPresence('away', 'Out to lunch');
       
#### Probe
Probe the state of the buddy

	/**
		@param jid - Buddy's id (eg:- abc@gmail.com)
		@param state -  State of the buddy.  value will be one of the following constant can be access via require('simple-xmpp').STATUS
			AWAY - Buddy goes away
			DND - Buddy set its status as "Do Not Disturb" or  "Busy",
			ONLINE - Buddy comes online or available to chat
			OFFLINE - Buddy goes offline
	*/

	xmpp.probe(jid, function(state) {

	})

### Fields
Fields provided Additional Core functionalies

#### xmpp.conn
The underline connection object

	var xmpp = simpleXMPP.connect({});
	xmpp.conn; // the connection object

#### xmpp.Element
Underline XMPP Element class

	var xmpp = simpleXMPP.connect({});
	xmpp.Element; // the connection objec


### Guides

