# node-simple-xmpp

Simple High Level NodeJS XMPP Library

## Install

`$ npm install simple-xmpp`

## Example

```javascript
var xmpp = require('simple-xmpp');

xmpp.on('online', function(data) {
	console.log('Connected with JID: ' + data.jid.user);
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
	jid: username@gmail.com,
	password: password,
	host: 'talk.google.com',
	port: 5222
});

xmpp.subscribe('your.friend@gmail.com');
// check for incoming subscription requests
xmpp.getRoster();
```

## Documentation

### Events

#### Online
Event emitted when successfully connected. Callback is passed an object containing information about the newly connected user.

```javascript
xmpp.on('online', function(data) {
	console.log('Yes, I\'m online');
});
```

#### Close
event where the connection has been closed

```javascript
xmpp.on('close', function() {
	console.log('connection has been closed!');
});
```

#### Chat
Event emitted when somebody sends a chat message to you

```javascript
xmpp.on('chat', function(from, message) {
	console.log('%s says %s', from, message);
});
```

#### Chat State
event emitted when a buddys chatstate changes [ 'active', 'composing', 'paused', 'inactive', 'gone' ]

```javascript
xmpp.on('chatstate', function(from, state) {
	console.log('% is currently %s', from, state);
});
```

#### Group Chat
event where emits when somebody sends a group chat message to you

```javascript
xmpp.on('groupchat', function(conference, from, message, stamp) {
	console.log('%s says %s on %s on %s at %s', 
                from, message, conference, stamp.substr(0,9), stamp.substr(10));
});
```

#### Buddy
Event emitted when state of the buddy on your chat list changes

```javascript
/**
	@param jid - is the id of buddy (eg:- hello@gmail.com)
	@param state - state of the buddy. value will be one of the following constant can be access 
                   via require('simple-xmpp').STATUS
		AWAY - Buddy goes away
		DND - Buddy set its status as "Do Not Disturb" or "Busy",
		ONLINE - Buddy comes online or available to chat
		OFFLINE - Buddy goes offline
	@param statusText - status message of the buddy (known as "custom message" in Gmail).
                        `null` if the buddy has not specified any status text.

	@param resource - is the last parameter of JID, which tells that the user is logged in via with device. 
                      (e.g mobile , Desktop )
*/
xmpp.on('buddy', function(jid, state, statusText, resource) {
	console.log('%s is in %s state - %s -%s', jid, state, statusText, resource);
});
```
#### Group Buddy
Event emitted when state of the buddy on group chat you recently joined changes

```javascript
xmpp.on('groupbuddy', function(conference, from, state, statusText) {
	console.log('%s: %s is in %s state - %s',conference, from, state, statusText);
});
```
#### Buddy capabilities
Event emitted when a buddy's client capabilities are retrieved. Capabilities specify which additional
features supported by the buddy's XMPP client (such as audio and video chat). See
[XEP-0115: Entity Capabilities](http://xmpp.org/extensions/xep-0115.html) for more information.

```javascript
xmpp.on('buddyCapabilities', function(jid, data) {
	// data contains clientName and features
	console.log(data.features);
});
```

#### Stanza
access core stanza element when such received
Fires for every incoming stanza

```javascript
/**
	@param stanza - the core object
	xmpp.on('stanza', function(stanza) {
		console.log(stanza);
	});
*/
```

### Methods

Send Chat Messages

```javascript
/**
	@param to - Address to send (eg:- abc@gmail.com - room@conference.domain.tld)
	@param message - message to be sent
	@param group - if true, send the message in a group chat
*/

xmpp.send(to, message, group);
```

Send Friend requests

```javascript
/**
	@param to - Address to send (eg:- your.friend@gmail.com)
*/
xmpp.subscribe(to);
```

Accept Friend requests

```javascript
/**
	@param from - Address to accept (eg:- your.friend@gmail.com)
*/
xmpp.acceptSubscription(from);
```

Unsubscribe Friend

```javascript
/**
	@param to - Address to unsubscribe (eg:- no.longer.friend@gmail.com)
*/
xmpp.unsubscribe(to);
```

Accept unsubscription requests

```javascript
/**
	@param from - Address to accept (eg:- no.longer.friend@gmail.com)
*/
xmpp.acceptUnsubscription(from);
```

Set presence

```javascript
/**
	@param show - Your current presence state ['away', 'dnd', 'xa', 'chat']
	@param status - (optional) free text as your status message
*/
xmpp.setPresence('away', 'Out to lunch');
```

Set chatstate

```javascript
/**
	@param to - The target JID (ie. person you are chatting with) to receive the chatstate
	@param state - Your current chatstate [ 'active', 'composing', 'paused', 'inactive', 'gone' ]
*/
xmpp.setChatstate('user@host.com', 'composing');
```

Get vCard

```javascript
/*
	@param buddy - The JID to use
	@param callback - The function to call when the vCard is retreived. The returned data will be a JSON object
*/
xmpp.getVCard('user@host.com', function (vcard) {
	console.log('user@host.com vcard: ', vcard);
});
```

Probe the state of the buddy

```javascript
/**
	@param jid - Buddy's id (eg:- abc@gmail.com)
	@param state -	State of the buddy.	 value will be one of the following constant can be access 
                    via require('simple-xmpp').STATUS
		AWAY - Buddy goes away
		DND - Buddy set its status as "Do Not Disturb" or	 "Busy",
		ONLINE - Buddy comes online or available to chat
		OFFLINE - Buddy goes offline
*/

xmpp.probe(jid, function(state) {

});
```

Disconnect session

```javascript
/**
	no params
*/

xmpp.disconnect();
```

### Fields
Fields provided Additional Core functionalies

#### xmpp.conn
The underlying connection object

```javascript
var xmpp = simpleXMPP.connect({});
xmpp.conn; // the connection object
```

#### xmpp.Element
XMPP Element class (from node-xmpp)

```javascript
var xmpp = simpleXMPP.connect({});
xmpp.Element; // the connection object
```

### Guides
