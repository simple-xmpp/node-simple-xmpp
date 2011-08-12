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

module.exports = new SimpleXMPP();

function SimpleXMPP() {
    
    var conn;

    var events = new EventEmitter();
    this.on = function() {
        events.on.apply(events, arguments);
    };

    this.send = function(to, message) {
        
        if(conn) {
            var stanza = new xmpp.Element('message', { to: to, type: 'chat' });
            stanza.c('body').t(message);
            conn.send(stanza);
        } else {
            console.log('not connected yet!');
        }
    };

    this.connect = function(params) {

        conn = new xmpp.Client(params);

        conn.on('online', function(){
            conn.send(new xmpp.Element('presence'));
            events.emit('online');
        });

        conn.on('stanza', function(stanza) {
            
            if (stanza.is('message')) {

                //getting the chat message
                if(stanza.attrs.type == 'chat') {

                    var message = stanza.getChild('body').getText();
                    var from = stanza.attrs.from;
                    events.emit('chat', from, message); 
                }
            }
        });

        conn.on('error', function(err) {
            events.emit('error', err);
        });

    };

}


