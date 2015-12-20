/*
	Tests are writter using nodeunit
*/

var horaa = require('horaa');
var nodemock = require('nodemock');
var xmpp = horaa('node-xmpp');
var Stanza = xmpp.Stanza
var conn = nodemock.ignore('on');
var simpleXMPP = require('simple-xmpp');

xmpp.hijack('Client', function() {
	return conn;
});

exports.testOnline = function(test) {

	conn.reset();
	//trigerring online event
	conn.mock('on').takes('online', function() {}).calls(1);
	conn.mock('on').takes('stanza', function() {});
	conn.mock('on').takes('error', function() {});

	conn.mock('send').takes(new Stanza('presence'));
	simpleXMPP.connect({});

	test.ok(conn.assert());
	test.done();
};


exports.testError = function(test) {

	conn.reset();

	conn.mock('on').takes('online', function() {});
	conn.mock('on').takes('stanza', function() {});
	conn.mock('on').takes('error', function() {});

	var stanza = new Stanza('message', { to: 'hello@gmail.com', type: 'chat' });
    stanza.c('body').t('hi');
    conn.send = function(aa) {
    	test.deepEqual(aa.toString(), stanza.toString());
    };

	simpleXMPP.connect({});
	simpleXMPP.send('hello@gmail.com', 'hi');

	test.ok(conn.assert());
	test.done();
};

exports.testOnChat = function(test) {

	test.expect(3);
	conn.reset();
	var from = 'hello@gmail.com';
	var message = 'hi';
	var stanza = new Stanza('message', { from: from + '/dsdsds', type: 'chat' });
    stanza.c('body').t(message);

	conn.mock('on').takes('online', function() {});
	conn.mock('on').takes('stanza', function() {}).calls(1, [stanza]);
	conn.mock('on').takes('error', function() {});

	simpleXMPP.on('chat', function(f, m) {
		test.equal(from, f);
		test.equal(message, m);
	});
	simpleXMPP.connect({});

	test.ok(conn.assert());
	test.done();
};

exports.testOnChatWithStazaEvent = function(test) {

	test.expect(4);
	conn.reset();
	var from = 'hello@gmail.com';
	var message = 'hi';
	var stanza = new Stanza('message', { from: from + '/dsdsds', type: 'chat' });
    stanza.c('body').t(message);

	conn.mock('on').takes('online', function() {});
	conn.mock('on').takes('stanza', function() {}).calls(1, [stanza]);
	conn.mock('on').takes('error', function() {});

	simpleXMPP.on('chat', function(f, m) {
		test.equal(from, f);
		test.equal(message, m);
	});

	simpleXMPP.on('stanza', function(stanza_) {
		test.ok(stanza == stanza_);
	});

	simpleXMPP.connect({});

	test.ok(conn.assert());
	test.done();
};


exports.testOnBuddyAway = function(test) {

	test.expect(3);
	conn.reset();
	var from = 'hello@gmail.com';
	var stanza = new Stanza('presence', { from: from + '/dsd'});
    stanza.c('show').t('away');

	conn.mock('on').takes('online', function() {});
	conn.mock('on').takes('stanza', function() {}).calls(1, [stanza]);
	conn.mock('on').takes('error', function() {});

	simpleXMPP.on('buddy', function(jid, state) {
		test.equal(jid, from);
		test.equal(state, 'away');
	});
	simpleXMPP.connect({});

	test.ok(conn.assert());
	test.done();
};

exports.testOnBuddyOffline = function(test) {

	test.expect(3);
	conn.reset();
	var from = 'hello@gmail.com';
	var stanza = new Stanza('presence', { from: from + '/dsd', type: 'unavailable'});

	conn.mock('on').takes('online', function() {});
	conn.mock('on').takes('stanza', function() {}).calls(1, [stanza]);
	conn.mock('on').takes('error', function() {});

	simpleXMPP.on('buddy', function(jid, state) {
		test.equal(jid, from);
		test.equal(state, 'offline');
	});
	simpleXMPP.connect({});

	test.ok(conn.assert());
	test.done();
};

exports.testProbe = function(test) {

	test.expect(2);
	conn.reset();
	var from = 'hello@gmail.com';
	var stanza = new Stanza('presence', { from: from + '/dsd'});
	stanza.c('show').t('away');

	conn.mock('on').takes('online', function() {}).calls(1);
	conn.mock('on').takes('stanza', function() {}).calls(1, [stanza]);
	conn.mock('on').takes('error', function() {});
 	conn.ignore('send');

	simpleXMPP.probe('hello@gmail.com', function(state) {
		test.equal(state, 'away');
	});

	simpleXMPP.connect({});

	test.ok(conn.assert());
	test.done();
};

exports.testOnError = function(test) {

	test.expect(2);
	conn.reset();

	conn.mock('on').takes('online', function() {});
	conn.mock('on').takes('stanza', function() {});
	var err = {code: 232};
	conn.mock('on').takes('error', function() {}).calls(1, [err]);

	simpleXMPP.on('error', function(e) {
		test.deepEqual(err, e);
	});
	simpleXMPP.connect({});

	test.ok(conn.assert());
	test.done();
};
