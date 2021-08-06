//learning promises

query

Gets all tabs that have the specified properties, or all tabs if no properties are specified.

    query(queryInfo: object): Promise < object >
        query(queryInfo: object, callback: function): void
            queryInfo
object
active
boolean optional
Whether the tabs are active in their windows.

    audible
boolean optional
Whether the tabs are audible.

    autoDiscardable
boolean optional
Chrome 54 +
    Whether the tabs can be discarded automatically by the browser when resources are low.

        currentWindow
boolean optional
Whether the tabs are in the current window.

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };

    let [tab] = await chrome.tabs.query(queryOptions);
    //queryoptions is an object with two properties, active and currentwindow which are optional properties of queryInfo
    //why is tab in brackets??

    return tab;

    //queryoptions = object with two properties
    //queryoptions plugs into queryinfo
    //queryinfo is an object of boolean and assorted properties
    //queryinfo: object, => queryOptions = {}.

    updateEnabledRulesets
    updateEnabledRulesets(options: UpdateRulesetOptions): Promise < object >
        updateEnabledRulesets(options: UpdateRulesetOptions, callback ?: function): void

            PROPERTIES
    disableRulesetIds
    string optional
    The set of ids corresponding to a static Ruleset that should be disabled.

        enableRulesetIds
    string optional
    The set of ids corresponding to a static Ruleset that should be enabled.


        so...similarly you can construct updateEnabledRulesets with either a promise or a callback
    //it seems implicit that updateEnabledRulesets and other properties categories are objects containing those props


    async function deactivateRuleset() {
        let disableRule = {
            disableRulesetIds: ["antiRedditTest"]
        };
        let ourPromise = await chrome.declarativeNetRequest.updateEnabledRulesets(disableRule);
        return ourPromise;
    }

    async function activateRuleset() {
        let enableRule = {
            enableRulesetIds: ["antiRedditTest"]
        };
        let ourPromise = await chrome.declarativeNetRequest.updateEnabledRulesets(enableRule);
        return ourPromise;
    }

    //hopefully that works

    /*
    Uncaught (in promise)
    TypeError: Error in invocation of
        declarativeNetRequest.updateEnabledRulesets(
            declarativeNetRequest.UpdateRulesetOptions
                options, optional function callback
            ):
    Error at parameter 'options':
    Error at property 'disableRulesetIds':
    Invalid type: expected array, found string.
    */

    create
    create(name ?: string, alarmInfo: AlarmCreateInfo): void
        AlarmCreateInfo
    PROPERTIES
    delayInMinutes
    number optional
    Length of time in minutes after which the onAlarm event should fire.

        periodInMinutes
    number optional
    If set, the onAlarm event should fire every periodInMinutes minutes after the initial event specified by when or delayInMinutes.If not set, the alarm will only fire once.

        when
    number optional
    Time at which the alarm should fire, in milliseconds past the epoch(e.g.Date.now() + n).

    let myAlarmInfo = {
        delayInMinutes: 1 //sets alarm for 1 minutes from activation
    }
    chrome.alarms.create(name = "active ruleset timer", myAlarmInfo);

    //now we have an active alarm that will go off 1 minute from now
    //so we need a listener to react to that alarm
    chrome.alarms.onAlarm.addListener(function () {
        //with the alarm triggered then we want to deactivate the ruleset again
        console.log('deactivating blocker');
        //instead of just a console log maybe we give a notification here
        deactivateBadge();
        deactivateRuleset();
    });


    where we're at now'
    if (alarm.name = 'too much time on tab') {
        //on this alarm activating we want to query whether we have any open tabs of the problem website
        let blockedUrl = { url: '*://*.reddit.com/*' }; //query url prop takes string or array of string 
        return chrome.tabs.query(blockedUrl) //this returns a promise with all the problem urls
            .then((tabs) => {
                console.log(tabs, 'made it into the promise then', 'tabs with the blocked url will now be closed.');
                if (!tabs.length) return; //exit if we don't have any tabs found from the query
                console.log('made it past the if statement');
                chrome.tabs.remove(tabs); //close the tabs found
                console.log('tabs successfully closed');
            })

        i'm getting into the .then statement, and both console logs are printing. however, I'm hitting an error on the remove function, because it's not receiving the right input

        Uncaught(in promise) TypeError: Error in invocation of tabs.remove([integer | array] tabIds, optional function callback): Error at parameter 'tabIds': Value did not match any choice.
        at serviceTester.js: 91
            (anonymous) @serviceTester.js: 91
        Promise.then(async)
            (anonymous) @serviceTester.js: 87

        but the promise at least is returning, and when we display 'tabs' in the first console log, we receive a list of objects
        the list has a number of objects equivalent to how many tabs we have open of the offending url.

        the remove function takes the tabID | list of tabIDs.tabID or array of Ids is the input of remove

        how can i take this list of objects and return a list of ids from that object instead ?
            maybe if we put the returned promise array into a map function and shoot that into the new remove fn

        first to test how the edge case is working where we check for the length.
        good news! the edge case is appropriately hitting the if statement and returning before we can get to the second console.log.

        so we need to do the mapping after that if statement so that we don't waste time building an array of 0 items.

        if (alarm.name = 'too much time on tab') {
            //on this alarm activating we want to query whether we have any open tabs of the problem website
            let blockedUrl = { url: '*://*.reddit.com/*' }; //query url prop takes string or array of string 
            return chrome.tabs.query(blockedUrl) //this returns a promise with all the problem urls
                .then((tabs) => {
                    console.log(tabs, 'made it into the promise then', 'tabs with the blocked url will now be closed.');
                    if (!tabs.length) return; //exit if we don't have any tabs found from the query
                    let map = tabs.map(t => t.id); // this creates a list of ids
                    console.log('made it past the if statement', 'here are a list of your tab ids', map);
                    chrome.tabs.remove(map); //close the tabs found
                    console.log('tabs from map successfully closed');
                });
        };

        it worked!!! yes yes yes! ok so that successfully closes out my tabs.just have to fix my colliding alarms

        ok found out when i inserted a console log to find out what my alarm name was.
        i was getting a good alarm name, but my if statements were declarative = not comparative ===
            rookie mistake lol
