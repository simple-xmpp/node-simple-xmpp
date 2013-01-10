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

var xmpp = require('node-xmpp');
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

module.exports = new SimpleXMPP();

function SimpleXMPP() {

    //setting status here
    this.STATUS = STATUS;
    var self = this;
    this.Element = xmpp.Element;
    var config;
    var conn;
    var probeBuddies = {};
    var $ = qbox.create();

    var events = new EventEmitter();
    this.on = function() {
        events.on.apply(events, arguments);
    };

    this.send = function(to, message) {

        $.ready(function() {
            var stanza = new xmpp.Element('message', { to: to, type: 'chat' });
            stanza.c('body').t(message);
            conn.send(stanza);
        });
    };

    this.subscribe = function(to) {

        $.ready(function() {
            var stanza = new xmpp.Element('presence', { to: to, type: 'subscribe' });
            conn.send(stanza);
        });
    };
    this.acceptSubscription = function(to) {
        // Send a 'subscribed' notification back to accept the incoming
        // subscription request
        $.ready(function() {
            var stanza = new xmpp.Element('presence', { to: to, type: 'subscribed' });
            conn.send(stanza);
        });
    };
    this.getRoster = function() {

        $.ready(function() {
            var roster = new xmpp.Element('iq', { id: 'roster_0', type: 'get' });
            roster.c('query', { xmlns: 'jabber:iq:roster' });
            conn.send(roster);
        });
    };
    this.probe = function(buddy, callback) {

        probeBuddies[buddy] = true;
        $.ready(function() {
            var stanza = new xmpp.Element('presence', {type: 'probe', to: buddy});
            events.once('probe_' + buddy, callback);
            conn.send(stanza);
        });
    };

    this.connect = function(params) {

        config = params
        conn = new xmpp.Client(params);
        self.conn = conn;

        conn.on('online', function(){
            conn.send(new xmpp.Element('presence'));
            events.emit('online');
            $.start();
            //make the connection live
            setInterval(function() {
               conn.send(new xmpp.Element('presence'));
            }, 1000 * 10)
        });

        conn.on('stanza', function(stanza) {
            events.emit('stanza', stanza);
            //console.log(stanza);
            //looking for message stanza
            if (stanza.is('message')) {

                //getting the chat message
                if(stanza.attrs.type == 'chat') {

                    var body = stanza.getChild('body');
                    if(body) {
                        var message = body.getText();
                        var from = stanza.attrs.from;
                        var id = from.split('/')[0];
                        events.emit('chat', id, message);
                    }
                }
            } else if(stanza.is('presence')) {

                var from = stanza.attrs.from;
                if(from) {
                  if(stanza.attrs.type == 'subscribe') {
                      //handling incoming subscription request
                      events.emit('subscribe', from);
                  } else {
                      //looking for presence stenza for availability changes
                      var id = from.split('/')[0];
                      var state = (stanza.getChild('show'))? stanza.getChild('show').getText(): STATUS.ONLINE;
                      state = (state == 'chat')? STATUS.ONLINE : state;
                      state = (stanza.attrs.type == 'unavailable')? STATUS.OFFLINE : state;
                      //checking if this is based on probe
                      if(probeBuddies[id]) {
                          events.emit('probe_' + id, state);
                          delete probeBuddies[id];
                      } else {
                          //specifying roster changes
                          events.emit('buddy', id, state);
                      }
                  }
                }
            }
        });

        conn.on('error', function(err) {
            events.emit('error', err);
        });

    };
}

// Allow for multiple connections
module.exports.SimpleXMPP = SimpleXMPP;
