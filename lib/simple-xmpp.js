/**

    The MIT License

    Copyright (c) 2011 Arunoda Susiripala

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.

 */

var xmpp = require('node-xmpp-client');
var Stanza = xmpp.Stanza; // http://node-xmpp.org/doc/ltx.html
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var qbox = require('qbox');

var STATUS = {
    AWAY: "away",
    DND: "dnd",
    XA: "xa",
    ONLINE: "online",
    OFFLINE: "offline"
};

var NS_CHATSTATES = "http://jabber.org/protocol/chatstates";

module.exports = new SimpleXMPP();

function SimpleXMPP() {

    //setting status here
    this.STATUS = STATUS;
    var self = this;
    var config;
    var conn;
    var probeBuddies = {};
    var joinedRooms = {};
    var capabilities = {};
    var capBuddies = {};
    var iqCallbacks = {};
    var $ = qbox.create();

    var events = new EventEmitter();
    this.on = function() {
        events.on.apply(events, Array.prototype.slice.call(arguments));
    };
    this.removeListener = function() {
        events.removeListener.apply(events, Array.prototype.slice.call(arguments));
    };

    this.events = events;
    this.conn = conn;

    this.send = function(to, message, group) {

        $.ready(function() {
            var stanza = new xmpp.Stanza('message', { to: to, type: (group ? 'groupchat' : 'chat') });
            stanza.c('body').t(message);
            conn.send(stanza);
        });
    };

    this.join = function(to, password) {

        $.ready(function() {
            var room = to.split('/')[0];
            if(!joinedRooms[room]){
                joinedRooms[room] = true;
            }
            var stanza =  new Stanza('presence', { to: to }).
            c('x', { xmlns: 'http://jabber.org/protocol/muc' });
            // XEP-0045 7.2.6 Password-Protected Rooms
            if (password !== null && password !== "")
                stanza.c('password').t(password);
            conn.send(stanza);
        });
    };

    this.invite = function(to, room, reason) {

        $.ready(function() {
            var stanza =  new Stanza('message', { to: room }).
            c('x', { xmlns: 'http://jabber.org/protocol/muc#user' }).
            c('invite', {to: to});
            if (reason)
                stanza.c('reason').t(reason);
            conn.send(stanza);
        });

    }

    this.subscribe = function(to) {

        $.ready(function() {
            var stanza = new Stanza('presence', { to: to, type: 'subscribe' });
            conn.send(stanza);
        });
    };

    this.unsubscribe = function(to) {

        $.ready(function() {
            var stanza = new Stanza('presence', { to: to, type: 'unsubscribe' });
            conn.send(stanza);
        });
    };

    this.acceptSubscription = function(to) {

        // Send a 'subscribed' notification back to accept the incoming
        // subscription request
        $.ready(function() {
            var stanza = new Stanza('presence', { to: to, type: 'subscribed' });
            conn.send(stanza);
        });
    };

    this.acceptUnsubscription = function(to) {

        $.ready(function() {
            var stanza = new Stanza('presence', { to: to, type: 'unsubscribed' });
            conn.send(stanza);
        });
    };

    this.getRoster = function() {

        $.ready(function() {
            var roster = new Stanza('iq', { id: 'roster_0', type: 'get' });
            roster.c('query', { xmlns: 'jabber:iq:roster' });
            conn.send(roster);
        });
    };

    this.probe = function(buddy, callback) {

        probeBuddies[buddy] = true;
        $.ready(function() {
            var stanza = new Stanza('presence', {type: 'probe', to: buddy});
            events.once('probe_' + buddy, callback);
            conn.send(stanza);
        });
    };

    function parseVCard(vcard) {
        //it appears, that vcard could be null
        //in the case, no vcard is set yet, so to avoid crashing, just return null
        if (!vcard) {
            return null;
        }
        return vcard.children.reduce(function(jcard, child) {
            jcard[child.name.toLowerCase()] = (
                (typeof(child.children[0]) === 'object') ?
                    parseVCard(child) :
                    child.children.join('')
            );
            return jcard;
        }, {});
    }

    this.getVCard = function(buddy, callback) {
        $.ready(function() {
            var id = 'get-vcard-' + buddy.split('@').join('--');
            var stanza = new Stanza('iq', { type: 'get', id: id }).
                c('vCard', { xmlns: 'vcard-temp' }).
                up();
            iqCallbacks[id] = function(response) {
                if(response.attrs.type === 'error') {
                    callback(null);
                } else {
                    callback(parseVCard(response.children[0]));
                }
            };
            conn.send(stanza);
        });
    };


   this.getVCardForUser = function(jid, user, callback) {
        $.ready(function() {
            var id = 'get-vcard-' + user.split('@').join('-');
            var stanza = new Stanza('iq', { from: jid, type: 'get', id: id, to: user }).
                c('vCard', { xmlns: 'vcard-temp' }).
                up();
            iqCallbacks[id] = function(response) {
                if(response.attrs.type === 'error') {
                    callback(null);
                } else {
                    var responseObj = {
                        vcard: parseVCard(response.children[0]),
                        jid: jid,
                        user: user
                    };
                    callback(responseObj);
                }
            };
            conn.send(stanza);
        });
    }

    // Method: setPresence
    //
    // Change presence appearance and set status message.
    //
    // Parameters:
    //   show     - <show/> value to send. Valid values are: ['away', 'chat', 'dnd', 'xa'].
    //              See http://xmpp.org/rfcs/rfc3921.html#rfc.section.2.2.2.1 for details.
    //              Pass anything that evaluates to 'false' to skip sending the <show/> element.
    //   status   - (optional) status string. This is free text.
    //   priority - (optional) priority integer. Ranges from -128 to 127.
    //              See http://xmpp.org/rfcs/rfc3921.html#rfc.section.2.2.2.3 for details.
    //
    // TODO:
    // * add caps support
    this.setPresence = function(show, status) {
        $.ready(function() {
            var stanza = new Stanza('presence');
            if(show && show !== STATUS.ONLINE) {
                stanza.c('show').t(show);
            }
            if(typeof(status) !== 'undefined') {
                stanza.c('status').t(status);
            }
            if(typeof(priority) !== 'undefined') {
                if(typeof(priority) !== 'number') {
                    priority = 0;
                } else if(priority < -128) {
                    priority = -128;
                } else if(priority > 127) {
                    priority = 127;
                }
                stanza.c('priority').t(parseInt(priority));
            }
            conn.send(stanza);
        });
    };

    // Method: setChatstate
    //
    // Send current chatstate to the given recipient. Chatstates are defined in
    // <XEP-0085 at http://xmpp.org/extensions/xep-0085.html>.
    //
    // Parameters:
    //   to    - JID to send the chatstate to
    //   state - State to publish. One of: active, composing, paused, inactive, gone
    //
    // See XEP-0085 for details on the meaning of those states.
    this.setChatstate = function(to, state) {
        $.ready(function() {
            var stanza = new Stanza('message', { to: to }).
                c(state, { xmlns: NS_CHATSTATES }).
                up();
            conn.send(stanza);
        });
    };

    // TODO: document!
    //
    // Options:
    //   * skipPresence - don't send initial empty <presence/> when connecting
    //
    this.disconnect = function() {
		$.ready(function() {
			var stanza = new Stanza('presence', { type: 'unavailable' });
			stanza.c('status').t('Logged out');
			conn.send(stanza);
		});

		var ref = this.conn.connection;
		if (ref.socket.writable) {
			if (ref.streamOpened) {
				ref.socket.write('</stream:stream>');
				delete ref.streamOpened;
			} else {
				ref.socket.end();
			}
		}
	};


    this.connect = function(params) {

        config = params;
        conn = new xmpp.Client(params);
        self.conn = conn;

        conn.on('close', function() {
            $.stop();
            events.emit('close');
        });

        conn.on('online', function(data){
            if(! config.skipPresence) {
                conn.send(new Stanza('presence'));
            }
            events.emit('online', data);
            $.start();

            // keepalive
            if(self.conn.connection.socket) {
              self.conn.connection.socket.setTimeout(0);
              self.conn.connection.socket.setKeepAlive(true, 10000);
            }
        });

        conn.on('stanza', function(stanza) {
            events.emit('stanza', stanza);
            //console.log(stanza);
            //looking for message stanza
            if (stanza.is('message')) {

                //getting the chat message
                if(stanza.attrs.type === 'chat') {

                    var body = stanza.getChild('body');
                    if(body) {
                        var message = body.getText();
                        var from = stanza.attrs.from;
                        var id = from.split('/')[0];
                        events.emit('chat', id, message);
                    }

                    var chatstate = stanza.getChildByAttr('xmlns', NS_CHATSTATES);
                    if(chatstate) {
                        // Event: chatstate
                        //
                        // Emitted when an incoming <message/> with a chatstate notification
                        // is received.
                        //
                        // Event handler parameters:
                        //   jid   - the JID this chatstate noticiation originates from
                        //   state - new chatstate we're being notified about.
                        //
                        // See <SimpleXMPP#setChatstate> for details on chatstates.
                        //
                        events.emit('chatstate', stanza.attrs.from, chatstate.name);
                    }

                } else if (stanza.attrs.type == 'groupchat') {

                    var body = stanza.getChild('body');
                    if (body) {
                        var message = body.getText();
                        var from = stanza.attrs.from;
                        var conference = from.split('/')[0];
                        var id = from.split('/')[1];
                        var stamp = null;
                        var delay = null;
                        if(stanza.getChild('x') && stanza.getChild('x').attrs.stamp)
                            stamp = stanza.getChild('x').attrs.stamp;
                        if(stanza.getChild('delay')) {
                            delay = {
                                stamp: stanza.getChild('delay').attrs.stamp,
                                from_jid: stanza.getChild('delay').attrs.from_jid
                            };
                        }
                        events.emit('groupchat', conference, id, message, stamp, delay);
                    }
                }
            } else if (stanza.is('presence')) {

                var from = stanza.attrs.from;
                if (from) {
                  if (stanza.attrs.type == 'subscribe') {
                      //handling incoming subscription requests
                      events.emit('subscribe', from);
                  } else if (stanza.attrs.type == 'unsubscribe') {
                      //handling incoming unsubscription requests
                      events.emit('unsubscribe', from);
                  } else {
                      //looking for presence stanza for availability changes
                      var id = from.split('/')[0];
					  var resource = from.split('/')[1];
                      var statusText = stanza.getChildText('status');
                      var state = (stanza.getChild('show'))? stanza.getChild('show').getText(): STATUS.ONLINE;
                      state = (state == 'chat')? STATUS.ONLINE : state;
                      state = (stanza.attrs.type == 'unavailable')? STATUS.OFFLINE : state;
                      //checking if this is based on probe
                      if (probeBuddies[id]) {
                          events.emit('probe_' + id, state, statusText);
                          delete probeBuddies[id];
                      } else {
                          //specifying roster changes
                          if (joinedRooms[id]){
                            var groupBuddy = from.split('/')[1];
                            events.emit('groupbuddy', id, groupBuddy, state, statusText);
                          } else {
                            events.emit('buddy', id, state, statusText,resource);
                          }
                      }

                      // Check if capabilities are provided
                      var caps = stanza.getChild('c', 'http://jabber.org/protocol/caps');
                      if (caps) {
                          var node = caps.attrs.node,
                              ver = caps.attrs.ver;

                          if (ver) {
                              var fullNode = node + '#' + ver;
                              // Check if it's already been cached
                              if (capabilities[fullNode]) {
                                  events.emit('buddyCapabilities', id, capabilities[fullNode]);
                              } else {
                                  // Save this buddy so we can send the capability data when it arrives
                                  if (!capBuddies[fullNode]) {
                                      capBuddies[fullNode] = [];
                                  }
                                  capBuddies[fullNode].push(id);

                                  var getCaps = new Stanza('iq', { id: 'disco1', to: from, type: 'get' });
                                  getCaps.c('query', { xmlns: 'http://jabber.org/protocol/disco#info', node: fullNode });
                                  conn.send(getCaps);
                              }
                          }
                      }

                  }
                }
            } else if (stanza.is('iq')) {
                if (stanza.getChild('ping', 'urn:xmpp:ping')) {
                    conn.send(new Stanza('iq', { id: stanza.attrs.id, to: stanza.attrs.from, type: 'result' }));
                }
                // Response to capabilities request?
                else if (stanza.attrs.id === 'disco1') {
                    var query = stanza.getChild('query', 'http://jabber.org/protocol/disco#info');

                    // Ignore it if there's no <query> element - Not much we can do in this case!
                    if (!query) {
                        return;
                    }

                    var node = query.attrs.node,
                        identity = query.getChild('identity'),
                        features = query.getChildren('feature');

                    var result = {
                        clientName: identity && identity.attrs.name,
                        features: features.map(function (feature) { return feature.attrs['var']; })
                    };

                    capabilities[node] = result;

                    // Send it to all buddies that were waiting
                    if (capBuddies[node]) {
                        capBuddies[node].forEach(function (id) {
                            events.emit('buddyCapabilities', id, result);
                        });
                        delete capBuddies[node];
                    }
                }

                var cb = iqCallbacks[stanza.attrs.id];
                if(cb) {
                    cb(stanza);
                    delete iqCallbacks[stanza.attrs.id];
                }
            }
        });

        conn.on('error', function(err) {
            events.emit('error', err);
        });

    };

}

SimpleXMPP.prototype.Element = xmpp.Element

// Allow for multiple connections
module.exports.SimpleXMPP = SimpleXMPP;
