// Add your requirements
var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.PORT || 3000, function()
{
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector
({ appId: 'b49c8a57-0e52-4bbd-8b88-84346542e6ec', appPassword: 'w4Mhs7DZfVZeNNbRNbayz98' });
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

bot.on('conversationUpdate', function (message) {
    console.log("Called Conversation updated");
    if (message.membersAdded && message.membersAdded.length > 0) {
        var isSelf = false;
        var membersAdded = message.membersAdded
            .map(function (m) {
                isSelf = m.id === message.address.bot.id;
                return (isSelf ? message.address.bot.name : m.name) || '' + ' (Id: ' + m.id + ')';
            })
            .join(', ');
        if (!isSelf) {
            console.log("not self");
            bot.send(new builder.Message()
                .address(message.address)
                .text('Welcome ' + membersAdded + "! How can i help you?"));
            bot.beginDialog(message.address,'/');
        }
    }
});

Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + parseInt(days));
    return this;
};

// Root dialog for entry point in application
bot.dialog('/', [
    function (session,args, next) {

        // Changes suggested by rakhi for demo 04-05-2017
        builder.Prompts.choice(session, "Please select an option below", "Payment Status|Inventory Information|Issues",
            {
                listStyle: builder.ListStyle.button,
                maxRetries: 2,
                retryPrompt: 'Please Provide main menu option'
            });
    },
    function (session, results) {
        if (results.response == undefined) {
            session.endDialog();
            session.replaceDialog('/');
        }
        else {
            // Changes suggested by rakhi for demo 04-05-2017
            var data = {};
            data.response = results.response.entity;

            session.send("HI");
           // RootMenu(session, data);
            // End

            /*RootMenu(session,results);*/
        }
    },
    function (session,results) {
        session.send("HI");
        console.log("root final : " + results.response);
       // RootMenu(session, results);
    }
]);