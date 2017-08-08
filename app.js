// Add your requirements
var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var o = require('odata');

var poData = [];

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
            var data = {};
            data.response = results.response.entity;

            //session.send("HI");
            RootMenu(session, data);
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
        session.beginDialog('/OpenLots');
    }
   else if (results.response.toUpperCase().indexOf("CREATE LOT") !== -1) {
       session.beginDialog('/CreateLot');
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
            endpoint: 'http://34.197.250.246/sap/opu/odata/sap/ZOD_QM_PO/',
            username: 'S4H_MM',
            password: 'alihana9',
            isAsync:true
        });
        o('POSet').get(function (data) {

          //  session.send(JSON.stringify(data));
            //same result like the first example on this page
            console.log('service response :->    ' + JSON.stringify(data));
            var result = data.d.results;
            poData = result;
            var poList = [];

            for (var i = 0, len = result.length; i < len && i<=5; i++) {
                poList.push(result[i].PoNumber);
            }

            if (poList !== undefined) {
                builder.Prompts.choice(session, "Please select a PO", poList,
                    {
                        listStyle: builder.ListStyle.button,
                        maxRetries: 2,
                        retryPrompt: 'Please provide PoNumber'
                    });
            }

        });
    },
    function (session,results,next) {


        getPODetails(results.response.entity, function (objDetails) {
            session.dialogData.poDetails = objDetails;
            session.send("Following are the details of your purchase order");
            session.send("PO No : " + objDetails.PoNumber + "\n\nComp Code : " + objDetails.CompCode + "\n\nPo Unit: 3" + objDetails.PoUnit + "\n\nVendor : " + objDetails.Vendor + "\n\nQuantity   :  " + objDetails.Quantity);
            session.dialogData.isDetailShown = true;

        });

        session.beginDialog('/ConversationEnd');

    }
]);

bot.dialog('/OpenLots', [
    function (session,results) {
        o().config({
            endpoint: "http://34.197.250.246/sap/opu/odata/sap/ZOD_QM_REC_INS_RESULT_SRV/",
            username: 'S4H_MM',
            password: 'alihana9',
            isAsync:true
        });
        o("ES_INSMASTER?$filter=Insplant eq '1710' and Instype eq '' and Inslotorg eq '01' and Insstartdate eq '15/02/2013' and Insenddate eq '31/08/2017'&$format=json").get(function (data) {

              //session.send(JSON.stringify(data));
            //same result like the first example on this page
            console.log('service response :->    ' + JSON.stringify(data));
            var result = data.d.results;
            var poList = [];

            for (var i = 0, len = result.length; i < len && i<=5; i++) {
                poList.push(result[i].Inslotno);
            }

            if (poList !== undefined) {
                builder.Prompts.choice(session, "Please select a Lot to View details", poList,
                    {
                        listStyle: builder.ListStyle.button,
                        maxRetries: 2,
                        retryPrompt: 'Please provide Lot Number'
                    });
            }

        });
    },

    function (session,results,next) {

        getLotDetails(results.response.entity, function (objDetails) {
            session.dialogData.poDetails = objDetails;
            session.send("Following are the details of Lot");
            session.send("Lot No : " + objDetails.Inslotno + "\n\nDescription : " + objDetails.desc + "\n\nSpecification: 3" + objDetails.spec);
            session.dialogData.isDetailShown = true;
            session.beginDialog('/ConversationEnd');

        });



    }

]);

bot.dialog('/CreateLot', [
    function (session,results) {
        o().config({
            endpoint: 'http://34.197.250.246/sap/opu/odata/sap/ZOD_QM_PO/',
            username: 'S4H_MM',
            password: 'alihana9',
            isAsync:true
        });
        o("POSet(PoNumber='4500000158')").patch({"Quantity" : "12"}).save(function (data) {

              session.send(JSON.stringify(data));

        });
    }
]);


bot.dialog('/ConversationEnd',[
    function (session) {
        session.conversationData  = {};
        builder.Prompts.text(session, 'Is there anything else i can help you with?');
    }
]);


function getLotDetails(poNumber,cb) {

    o().config({
        endpoint: "http://34.197.250.246/sap/opu/odata/sap/ZOD_QM_REC_INS_RESULT_SRV/",
        username: 'S4H_MM',
        password: 'alihana9',
        isAsync: true
    });
    o("ES_INSMASTER?$filter=Inslotno eq '" + poNumber + "'&$expand=NAVMASTERDETAIL").get(function (data) {

        //session.send(JSON.stringify(data));
        //same result like the first example on this page
        var obj = {};
        obj.Inslotno = data.d.results[0].NAVMASTERDETAIL.results[0].Inslotno;
        obj.desc = data.d.results[0].NAVMASTERDETAIL.results[0].Inschardesc;
        obj.spec = data.d.results[0].NAVMASTERDETAIL.results[0].Insdesc;


        cb(obj);


    })
}

function getPODetails(poNumber,cb) {
// user poData for further details
    var objDetails = {};
    for (var i = 0, len = poData.length; i < len|| i<=5; i++) {
        if (poData[i].PoNumber === poNumber) {
            objDetails = poData[i];
            break;
        }
    }
    cb(objDetails);
}
