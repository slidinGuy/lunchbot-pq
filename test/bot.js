var assert = require('assert');
var sinon = require('sinon');
const LunchBot = require('../src/bot');

describe('Test LunchBot',  () => {
    const lunchBot = new LunchBot({
        token: "xoxb-123456789",
        fb_token: "fb123456789",
        zomato_token: "ab123456789"
    });
    lunchBot.user = {
        id: 'U6CD6S3DG'
    }

    lunchBot.channels = [
        {
            created: 1500726384,
            creator: "U6D69RGQ6",
            has_pins: false,
            id: "C6C7C9Z2P",
            is_archived: false,
            is_channel: true,
            is_mpim: false,
            is_org_shared: false,
            is_private: false,
            is_shared: false,
            last_read: "1500808014.662791"
        }
    ]

    describe('Message check', () => {
        before(() => {
            sinon.spy(lunchBot, 'checkMessageContent');    
        });

        it('Should ignore message from lunchbot', () => {
            lunchBot.handleOnMessage({
                channel:"D6S68QCLW",
                text:"<@U6CD6S3DG> test",
                ts:"1509193166.000068",
                type:"message",
                user:"U6CD6S3DG"
            });
            assert(!lunchBot.checkMessageContent.calledOnce);
        });

        it('Should process message', () => {
            lunchBot.handleOnMessage({
                channel:"D6S68QCLW",
                source_team:"T6DCDCJF9",
                team:"T6DCDCJF9",
                text:"<@U6CD6S3DG> test",
                ts:"1509193166.000068",
                type:"message",
                user:"U6R9F4P4J"
            });
            assert(lunchBot.checkMessageContent.calledOnce);
        });

        after(() => {
            lunchBot.checkMessageContent.restore();    
        });
    });
});
