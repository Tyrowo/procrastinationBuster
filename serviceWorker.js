//first we'll make a storage object for all our user settings
let siteCache = {
    dynamicIds: ['no 0th id', null, null, null, null, null, null, null, null, null, null],
    siteCount: 0,
    curRuleset: [], //this will be a list of all our rules to dynamically turn on and off
    //now two properties for our time settings
    closeTabs: { delayInMinutes: 60 }, //default to 60
    deactivate: { delayInMinutes: 1440 } //default to 1440, i.e. 1 day. this val must be greater than CloseTabs
};
let activity = false; //var to indicate if our timeout has been set from a change in activity
let visited = false; //var to indicate if we've visited any trigger websites during our warning period


chrome.runtime.onInstalled.addListener(
    function () {
        console.log('hello');
        let syncCheck = null;
        chrome.storage.sync.get(['syncCache'], function (x) {
            if (x.syncCache) {
                if (x.syncCache.newValue !== undefined) { //this will hit an error on the first input site but still work lol
                    siteCache = x.syncCache.newValue;
                }
            }
        });
        if (syncCheck !== undefined && syncCheck !== null) siteCache = syncCheck.newValue;

        chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80] });
        //want to delete all rules just in case someone uninstalls with the blocker turned on and needs to reinstall to delete the blocks

        //if our user doesn't have any saved settings from their sync storage we pull up the options page
        if (!syncCheck) {
            chrome.runtime.openOptionsPage();
        }
    });

//this is our function for when a user adds a site to their banned list
async function userInputSite(urlString) {
    visited = false;//when someone adds a site let's refresh the visited indicator

    //should refresh the site cache before doing anything
    console.log('siteCache before refresh', siteCache);
    refreshCache()
    setTimeout(function () {

        console.log('siteCache is this right now:', siteCache);
        //check if userinput urlstring is already a rule in our dictionary
        if (siteCache.dynamicIds.indexOf(urlString) > -1) {
            console.log('hit duplicate url');
            let urlDupe = new NotificationClass('Duplicate URL', `You already have ${urlString} in your list of restricted URLs.`)
            notifyClear('urlDupe');
            notifyClear('Site Restricted');
            notifyUser(urlDupe);
            return;
        }
        //now we have to check if we have too many sites in our cache- I don't want to overload the chrome ruleset maximum
        if (siteCache['siteCount'] >= 10) {
            let sitesMaxxed = new NotificationClass('Too Many Restricted Sites', 'The maximum amount of allowed site restrictions are 10. Please delete one or more of your current site restrictions to add new ones.');
            notifyUser(sitesMaxxed);
            return;
        }
        //first add site listener
        //logic to turn our listener registration function in to a named function, and then add the listener
        var newListener = function (details) {
            triggerOnCompleted(details);
        };
        chrome.webNavigation.onCompleted.addListener(newListener, { url: [{ hostContains: urlString }] });

        //gotta get the first null value in the array
        for (let i = 1; i < siteCache['dynamicIds'].length; i++) { //start at 1 because 0 should never be null
            if (siteCache['dynamicIds'][i] === null) { //find null value
                siteCache['dynamicIds'][i] = urlString;
                console.log('set idNumber to ', i);
                break;
            };
        };
        //then we need to update our dictionary.
        //add url and paired function to restricted sites dictionary, increment our site count
        siteCache[urlString] = newListener;
        siteCache['siteCount']++;

        //after updating all of this we should update our siteCache ruleset too
        siteCache['curRuleset'] = createDynamicRuleset(siteCache['dynamicIds']);

        //now update sync storage
        chrome.storage.sync.set({ syncCache: siteCache });
        //now notify user that the site has successfully been restricted
        console.log(`successfully added site restriction for ${urlString}`);
        let restrictedSite = new NotificationClass('Site Restricted', `You have successfully restricted access to ${urlString}.`);
        notifyClear('Site Restricted');
        notifyUser(restrictedSite);
        console.log(siteCache['curRuleset']);

    }, 10);
};

//now we have two active alarms to listen for
chrome.alarms.onAlarm.addListener(function (alarm) {
    console.log(alarm.name);
    //check which alarm we're looking at

    //gonna use our alarm listeners to refresh our site cache
    refreshCache();
    setTimeout(function () {

        console.log(siteCache);
        //this pulls our settings to make sure our synced storage links and times are refreshed

        //the first alarm kicks us out of the tabs and initiates the blocker
        if (alarm.name === 'too much time on tab') {
            //first clear out our old notification
            notifyClear('You have accessed a restricted site');
            //now we make a new notification
            let remainingTime = siteCache.deactivate.delayInMinutes - siteCache.closeTabs.delayInMinutes;
            let timeOver = new NotificationClass('Activating Blocker',
                `Time allowed has expired. Access to restricted site is blocked and all tabs are closed. You will be allowed back on in ${remainingTime} minutes.`);
            notifyUser(timeOver);
            console.log('activating blocker');
            activateBadge(remainingTime);
            //we can use the storaged ruleset in our object to enable and disable
            console.log(siteCache['curRuleset']);
            chrome.declarativeNetRequest.updateDynamicRules({ addRules: siteCache['curRuleset'] }); //update dynamic rules takes an object with addRules &/or removeRuleIds
            //on this alarm activating we want to query whether we have any open tabs of the problem website
            let queryArray = mapObjectsToQuery(siteCache['dynamicIds'])
            queryArray.forEach(url => //by acting on an array of url codes we can close the tabs of all of them
                chrome.tabs.query(url) //this returns a promise with all the problem urls. doesn't need Return prefix inside the forEach
                    .then((tabs) => {
                        if (!tabs.length) return; //exit if we don't have any tabs found from the query

                        let map = tabs.map(t => t.id); // this creates a list of ids
                        chrome.tabs.remove(map); //close the tabs found
                        console.log('tabs from map successfully closed');
                    }));

            //after successfully clearing out all our tabs, then we set our visited status to false 
            visited = false; //this gets us ready to visit another restricted website whenever our blocker comes down
        };
        //the second alarm deactivates the blocker
        if (alarm.name === 'active ruleset timer') {
            //with the alarm triggered then we want to deactivate the ruleset again
            console.log('deactivating blocker');
            //instead of just a console log maybe we give a notification here
            deactivateBadge();
            chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80] });
            //now that the rules allow for use of the website again, we notify the user that they have access again
            notifyClear('Activating Blocker'); //clear out the old notification first
            let accessRestored = new NotificationClass('Access Restored', `Your time limit has expired, and you've regained access to your restricted sites.`);
            notifyUser(accessRestored);
        };
    }, 10);
});

//splitting the onCompleted listener logic into its own function to create new listeners every time a user
//adds a new site to their restricted websites
//you're allowed to visit website ony once, then this triggers and activates the ruleset
async function triggerOnCompleted(details) {
    //need to make sure that this only triggers once per navigation
    console.log(details);
    if (details.frameId !== 0) return;

    //check if we've already visited once before proceeding
    if (visited === true) return;
    //then if not we set it to true
    visited = true;

    //we need to get our current alarms, get all returns them as an array
    let prevAlarms = await chrome.alarms.getAll();

    //now we should refresh our cache to make sure that our time settings are correct before adding alarms
    refreshCache();
    setTimeout(function () {
        //console.log('prevalarms', prevAlarms, prevAlarms.length); to check alarm detection

        //first we make sure there are no previous alarms set, so we don't double up on this function
        if (prevAlarms.length === 0) {

            //need to clear notifications left over from the last cycle of banning
            notifyClear('Access Restored');
            //to create a notification we create a new member of our class and pass that into the notify function
            let siteVisited = new NotificationClass('You have accessed a restricted site', `You will be allowed ${siteCache.closeTabs.delayInMinutes} minutes until you are kicked off of all restricted sites.`);
            //we notify the user and initiate a warning badge
            notifyUser(siteVisited);
            warningBadge(siteCache.closeTabs.delayInMinutes);
            console.log('warning initiated, setting alarms');
            //here we've got to add two timers:
            //timer to boot you out of the reddit tab after x time
            chrome.alarms.create(name = 'too much time on tab', siteCache.closeTabs);
            //then we need another alarm to turn the ruleset back off
            chrome.alarms.create(name = 'active ruleset timer', siteCache.deactivate);
            console.log('both alarms successfully set');

        }
    }, 10);
};

//and here are two functions to turn on or off the badge
function activateBadge(time) {
    let initTime = time * 60;
    chrome.action.setBadgeBackgroundColor({ color: '#F00' }); //can add callback function if you want to cascade
    countDown(initTime);
}
function deactivateBadge() {
    //when it's time to deactivate the badges let's clear out all our intervals to make sure we don't leave any
    intervalStorage.clearAll();
    //with all our intervals cleared out we should be able to start again without issues
    console.log('cleared all intervals')
    chrome.action.setBadgeText({ text: '' }); //this line successfully turns the badge off
}
//and a function to start the badge saying that your time on the site is counting down
function warningBadge(time) {
    let initTime = time * 60;
    chrome.action.setBadgeBackgroundColor({ color: '#FF6700' });
    countDown(initTime);
}


//I want to create a class here to make creating the notifications object a little easier
let NotificationClass = class {
    constructor(title, message) {
        this.title = title;
        this.message = message;
        this.type = 'basic';
        this.iconUrl = './tyFav128.png';
        this.priority = 1;
        this.silent = true;
    }
};
//here are two functions to create a user notification, and one to delete notification objects
function notifyUser(notifObj) {
    chrome.notifications.create(notifObj.title, notifObj, function (notificationId) {
        console.log(notificationId, 'notification created');
    });
};
function notifyClear(notifId) {
    //if statement is unnecessary, no error if there isn't one.
    //Could add a check to make this console log not show up though
    chrome.notifications.clear(notifId, () => {
        console.log('old notification cleared');
    })
}

//map and forEach aren't working, so I've made two functions to make object arrays for url validation
function mapObjectsToQuery(arr) {
    let qArr = [];
    for (let i = 0; i < arr.length; i++) {
        qArr.push({ url: `*://*.${arr[i]}/*` });
    }
    return qArr;
};

//function to create a new ruleset for the set of urls
function createDynamicRuleset(urlArray) {
    //create a storage object for our new ruleset in the correct format for our dynamic ruleset
    let ruleset = [];
    //iterate over our list of website domains
    for (let i = 1; i < urlArray.length; i++) { //start at 1 because no 0 index
        if (urlArray[i] !== null) { //check if they're not empty slots
            let filter = `*://*.${urlArray[i]}/*` //convert to filter format
            //create an object that's the rule format with the input of the id number and the new filter formatted url
            let newRule = {
                'id': i + 69, //adding 69 to the id number to hopefully never overlap with other extension rules
                'priority': 1,
                'action': { 'type': 'block' },
                'condition': {
                    'urlFilter': filter,
                    'resourceTypes': ['main_frame']
                }
            };
            ruleset.push(newRule); //and push that rule into our list of rules
        }
    }
    return ruleset;
};

//this is our function for when a user removes a site from their restricted list
async function userRemoveSite(urlString) {
    //first let's refresh the cache to be safe
    refreshCache();
    setTimeout(function () {

        //check if userinput urlstring is already a rule in our dictionary
        if (siteCache.dynamicIds.indexOf(urlString) == -1) {
            console.log(`${urlString} not found in dynamicIds, could not be deleted.`)
            return;
        };
        //check if the userinput is null
        if (urlString === null) {
            console.log(`cannot delete null, but that's okay. :) `)
            return;
        };

        //first remove the site listener
        //our listener function's name is saved in our site cache
        console.log('deleting listener');
        chrome.webNavigation.onCompleted.removeListener(siteCache[urlString]);

        //gotta find the site in the array and nullify it
        console.log(siteCache['dynamicIds'],);
        let idNumber = siteCache['dynamicIds'].indexOf(urlString);
        siteCache['dynamicIds'][idNumber] = null;
        //then we need to remove it from our dictionary and decrement our site count
        delete siteCache[urlString];
        siteCache['siteCount']--;
        //after removing all of this info we need to update our siteCache ruleset too, will have one fewer rule than before
        siteCache['curRuleset'] = createDynamicRuleset(siteCache['dynamicIds']);

        //then we update our sync cache
        chrome.storage.sync.set({ syncCache: siteCache });

        //now notify the user that the site has successfully been removed
        console.log(`successfully removed site restriction for ${urlString}`);
        let removedRestriction = new NotificationClass('Site Restriction Removed', `You have removed your restrictions to access ${urlString}. If the blocker is currently active, wait for deactivation to access the site.`);
        notifyClear('Site Restriction Removed');
        notifyUser(removedRestriction);
        //this way of removing will remove it from the ruleset, but will not be immediately accessible if restriction is currently in place
        console.log(siteCache['curRuleset']);

    }, 10);
};


//now we're on to front end scripting for the options page

//storage listener to receive input from options page
chrome.storage.onChanged.addListener(function (changes) {
    console.log(changes);
    //show what's being changed in storage just because it helps me debug

    //if the changes received are a userinput then we add the website or change the time preferences
    if (changes.userInput) {
        console.log('new user input:', changes.userInput);
        //code for if we need to change our time settings
        if (changes.userInput.newValue[0] === 'new times') {
            console.log('found array entry', changes.userInput.newValue[1], changes.userInput.newValue[2]);
            siteCache.closeTabs = { delayInMinutes: +changes.userInput.newValue[1] };
            let deTime = +changes.userInput.newValue[1] + +changes.userInput.newValue[2];
            //remember to add pluses, apparently these arrays hold strings from the form input instead of nums
            siteCache.deactivate = { delayInMinutes: deTime };
            //after changing the interior storage update the sync storage
            chrome.storage.sync.set({ syncCache: siteCache });
            let timePrefs = new NotificationClass('Time Preferences Set', `You've successfully updated your user settings.`);
            notifyClear('Time Preferences Set');
            notifyUser(timePrefs);
        }

        //if we need to add a url we've already got the userinputsite function to handle most of that
        if (changes.userInput.newValue[0] === 'new url') {
            console.log('received new url to restrict', changes.userInput.newValue[1]);
            userInputSite(changes.userInput.newValue[1]);
            //should give a log and a user alert at the end of the user input site
        }
    }

    //if the info passed is a deletion input we remove the website in the array
    if (changes.userDeletion) {
        console.log(changes.userDeletion);
        //userremovesite has all the logic we need to delete a site from our list
        userRemoveSite(changes.userDeletion.newValue[1]);
        console.log(`deleted website ${changes.userDeletion.newValue[1]}`)
    }
});

//a function to refresh the cache of our extension and make sure we're using the correct sync data
async function refreshCache() {
    chrome.storage.sync.get(['syncCache'], function (x) {
        if (x.syncCache) {
            console.log('inside if statement in sync.get', x.syncCache);
            siteCache = x.syncCache;
        }
    });
};

//when the user goes active I want to refresh an interval that will periodically refresh our listeners, 
//which will keep our page blocker active throughout internet use
chrome.idle.onStateChanged.addListener(function (idleState) {
    console.log(idleState);
    //don't want a notification to the user, it's obnoxious, but a console log will let us know when it idles
    //whenever the user goes active I want them to refresh their listeners, and then periodicall refresh
    if (idleState === 'active') {
        checkActivity(); //this will refresh our listeners and then do a check in 5 mins to refresh them again
        //hopefully only putting one mark at a time so we don't get a million overlapping
    };

    //just to be safe I want to clear this interval when we go inactive so we don't have a million.
    if (idleState === 'inactive') {
        clearInterval(refreshInt);
    }
});

//moving the logic of refreshing the listeners into its own function so that we can create a more resilient
//set interval function above
function refreshListeners() {
    console.log('refreshing listeners');
    refreshCache();
    setTimeout(function () {

        for (let i = 1; i < siteCache.dynamicIds.length; i++) {
            let urlString = siteCache.dynamicIds[i];

            if (urlString !== null) {
                console.log(`refreshing listener for ${urlString}`)
                //first we remove the listener
                chrome.webNavigation.onCompleted.removeListener(siteCache[urlString]);
                //then we add it with the same function it should be the same? 
                var newListener = function (details) {
                    triggerOnCompleted(details);
                };
                chrome.webNavigation.onCompleted.addListener(newListener, { url: [{ hostContains: urlString }] });
                //then we need to update our site settings in our cache to make sure the listener function matches
                siteCache[urlString] = newListener;
            }
        };
        console.log('url listeners have been refreshed. refreshing storage.')
        //and finally after all of those listeners have been replaced, we update our sync storage
        chrome.storage.sync.set({ syncCache: siteCache });
    }, 20);
}

//113, 162 are our calls to the badge functions
//ok so to solve this counting down issue we're gonna store some intervals in a storage object
let intervalStorage = {
    intervals: new Set(),
    clearAll() {
        console.log('clearing intervals. current storage:', this.intervals);
        for (let ids of this.intervals) {
            clearInterval(ids);
        };
        this.intervals.clear();
        console.log('intervals should be removed. current set is clear: ', this.intervals)
        return;
    }
};
//the real issue going on is when you do too many clicks during your navigation at once, you add like 4 listeners from the oncompleted
//and theyre all ticking down at once? I think that's what's going on. But I think if we delete all the listeners from this storage
//it should fix our issues. Although it looks a little weird that we have 4 listeners at once sometimes.
function countDown(time) {
    //received time should be our time in seconds because we multiply by 60 in our badges
    let curTime = time;
    let badgeText;

    //before initiating our interval we do an assessment of how much time is left
    //so that we can initiate the badge.
    if (curTime > 86400) {
        let tempTime = Math.floor(curTime / 86400);
        badgeText = `>${tempTime}d`
    } else if (curTime > 3600) {
        let tempTime = Math.floor(curTime / 3600);
        badgeText = `>${tempTime}h`;
    } else if (curTime > 120) {
        let tempTime = Math.floor(curTime / 60);
        badgeText = `>${tempTime}m`
    } else {
        badgeText = `${curTime}s`;
    }

    chrome.action.setBadgeText({ text: badgeText });

    //even though i have a named function going into intervals,
    //apparently chrome extension likes them to be wrapped in a function
    //now that I have this cute interval storage we'll use that
    let interval = setInterval(function () { refreshBadge() }, 1000);
    intervalStorage.intervals.add(interval);
    console.log('created new interval', intervalStorage.intervals);
    //including this inside of the countdown function so that it has access
    //to the variables curtime and interval to shut off the interval
    function refreshBadge() {
        curTime--; //first we decrement the time given bc we've waited a sec
        //console.log('leak testing', interval, 'interval ', curTime)

        //gotta assess how much time is remaining for our user's period
        if (curTime > 86400) {
            let tempTime = Math.floor(curTime / 86400);
            badgeText = `>${tempTime}d`
        } else if (curTime > 3600) {
            let tempTime = Math.floor(curTime / 3600);
            badgeText = `>${tempTime}h`;
        } else if (curTime > 120) {
            let tempTime = Math.floor(curTime / 60);
            badgeText = `>${tempTime}m`
        } else if (curTime === 2) {
            chrome.action.setBadgeText({ text: '' });
            intervalStorage.clearAll();
        } else if (curTime === 1) {
            chrome.action.setBadgeText({ text: '' });
            intervalStorage.clearAll();
        } else if (curTime <= 0) {
            intervalStorage.clearAll();
        } else {
            badgeText = `${curTime}s`;
        }

        //then update the badge with how much time they have left if there's time remaining
        if (curTime > 2) chrome.action.setBadgeText({ text: badgeText });
        //console.log('counting down time, ', curTime);
    }
}

//this function is to refresh our activity and refresh our listeners every 5 minutes, without
//allowing the function to be repeated multiple times by multiple periods of inactivity and activity by the user
function checkActivity() {
    refreshListeners();
    console.log('checking activity. activity status is: ', activity);
    if (activity === false) {
        activity = true;
        setTimeout(function () {
            console.log('end of 5 min timer. setting activity to false to refresh timer');
            activity = false;
            checkActivity();
        }, 300000);
        console.log('activity set to: ', activity, '. timeout to check activity in 5 mins set.');
    }

}
