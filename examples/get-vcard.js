
var xmpp = require('../lib/simple-xmpp');
var readline = require('readline');

var argv = process.argv.slice(2);

if(argv.length !== 3) {
    console.log("Usage: " + process.argv.slice(0, 2).join(' ') + " <your-jid> <password> <other-jid>");
    process.exit(127);
}

xmpp.on('online', function() {
    xmpp.getVCard(argv[2], function(vcard) {
        console.log(vcard);
        process.exit(0);
    });
});

xmpp.connect({
    jid: argv[0],
    password: argv[1]
});
