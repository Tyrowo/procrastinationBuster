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