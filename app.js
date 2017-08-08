// Add your requirements
var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var o = require('odata');

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
                .text('Hello!'));    // .text('Hello ' + membersAdded + "! How can i help you?"));
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
        builder.Prompts.choice(session, "What would you like to do today?", "View Open PO|View Open Lots|Create Lot|Result Recording ",
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
           /* var data = {};
            data.response = results.response.entity;

            //session.send("HI");
            RootMenu(session, data);*/
            // End

            /*RootMenu(session,results);*/
        }
    },
    function (session,results) {
       // session.send("HI");
        console.log("root final : " + results.response);
        RootMenu(session, results);
    }
]);

function RootMenu(session,results) {

   if (results.response.toUpperCase().indexOf("VIEW OPEN PO") !== -1) {
        session.beginDialog('/OpenPO');
    }
    else if (results.response.toUpperCase().indexOf("VIEW OPEN LOTS") !== -1) {
        session.beginDialog('/issues');
    }
   else if (results.response.toUpperCase().indexOf("CREATE LOT") !== -1) {
       session.beginDialog('/ClearData');
   }
   else if (results.response.toUpperCase().indexOf("RESULT RECORDING") !== -1) {
       session.beginDialog('/ClearData');
   }
   else if (results.response.toUpperCase().indexOf("CLEAR") !== -1) {
        session.beginDialog('/ClearData');
    }
    else if (results.response.toUpperCase().indexOf("NO") !== -1) {
        session.send("Ok then "+session.message.user.name +", Goodbye :)");
        session.endDialog();
    }
    else if (results.response.toUpperCase().indexOf("YES") !== -1) {
        session.beginDialog('/');
    } else {
        session.send("Not Understood.");
        session.beginDialog('/',{response :'NU'});
    }

}

bot.dialog('/OpenPO', [
    function (session,results) {
        o().config({
            endpoint: 'http://34.197.250.246/sap/opu/odata/sap/ZINFA_PO_SRV/',
            username: 'TRAIN128_A21',
            password: 'bcone@123',
            isAsync:true
        });
        o('POSet').get(function (data) {

            session.send(JSON.stringify(data));
            //same result like the first example on this page
           /* console.log('service response :->    ' + JSON.stringify(data));
            var result = data.d.results;
            poData = result;
            var poList = [];

            for (var i = 0, len = result.length; i < len && i<=5; i++) {
                poList.push(result[i].PoNumber);
            }
            cb(poList);*/
        });
    }
    /*function (session, results) {
        if (results.response == undefined) {
            session.endDialog();
            session.replaceDialog('/');
        }
        else {
            session.send("Following are the details of your product");
            session.send("Product : " + results.response.entity + "\n\nStock   : 120 Units \n\nWeekly rate of consumption   : 46 Units \n\nReorder Level : 50 ");
            session.beginDialog('/ConversationEnd');
        }
    },
    function (session,results) {
        session.endDialogWithResult(results);
    }*/
]);