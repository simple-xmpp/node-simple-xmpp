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

module.exports = new SimpleXMPP();

function SimpleXMPP() {
    
    var conn;

    var chatCallback;
    var errorCallback;
    var onlineCallback;

    this.onChat = function(callback) {
        chatCallback = callback;
    };

    this.onError = function(callback) {
        errorCallback = callback;
    };

    this.onOnline = function(callback) {
        onlineCallback = callback;
    };

    this.send = function(to, message) {
        
        if(conn) {
            conn.send(new xmpp.Element('message',
            { 
                to: to, // to
                type: 'chat'}).
                c('body').
                t(message));
        } else {
            console.log('not connected yet!');
        }
    };

    this.connect = function(params) {

        conn = new xmpp.Client(params);

        conn.on('online', function(){
            conn.send(new xmpp.Element('presence'));
            if(onlineCallback) {
                onlineCallback();
            }
        });

        conn.on('stanza', function(stanza) {
            if (stanza.is('message') && stanza.attrs.type !== 'error') {

                var chat = stanza.children[0];
                if(chat.name == 'body') {
                    var message = stanza.children[0].children[0];
                    var from = stanza.attrs.from;
                    if(chatCallback) {
                        chatCallback(from, message);
                    }   
                }
            }
        });

        conn.on('error', function(err) {
            if(errorCallback) {
                errorCallback(err);
            }
        });

    };


    
}


