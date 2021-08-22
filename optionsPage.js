//header button visibility togglers

document.getElementById('button 1').addEventListener('click', function (e) {
    makeVisible('Instructions');
});
document.getElementById('button 2').addEventListener('click', function (e) {
    makeVisible('Info');
});
document.getElementById('button 3').addEventListener('click', function (e) {
    makeVisible('FAQ');
});
document.getElementById('button 4').addEventListener('click', function (e) {
    makeVisible('User Settings');
    populateSettings();

});

function makeVisible(id) {
    console.log('is this working?');
    document.getElementById('FAQ').style.display = 'none';
    document.getElementById('Instructions').style.display = 'none';
    document.getElementById('User Settings').style.display = 'none';
    document.getElementById('Info').style.display = 'none';

    document.getElementById(id).style.display = 'inline';
};


//faq button visibility togglers, for 5 different topics

document.getElementById('faqB1').addEventListener('click', function (e) {
    if (document.getElementById('faq1').style.display === 'none') {
        document.getElementById('faq1').style.display = 'block';
    } else {
        document.getElementById('faq1').style.display = 'none';
    }
});
document.getElementById('faqB2').addEventListener('click', function (e) {
    if (document.getElementById('faq2').style.display === 'none') {
        document.getElementById('faq2').style.display = 'block';
    } else {
        document.getElementById('faq2').style.display = 'none';
    }
});
document.getElementById('faqB3').addEventListener('click', function (e) {
    if (document.getElementById('faq3').style.display === 'none') {
        document.getElementById('faq3').style.display = 'block';
    } else {
        document.getElementById('faq3').style.display = 'none';
    }
});
document.getElementById('faqB4').addEventListener('click', function (e) {
    if (document.getElementById('faq4').style.display === 'none') {
        document.getElementById('faq4').style.display = 'block';
    } else {
        document.getElementById('faq4').style.display = 'none';
    }
});
document.getElementById('faqB5').addEventListener('click', function (e) {
    if (document.getElementById('faq5').style.display === 'none') {
        document.getElementById('faq5').style.display = 'block';
    } else {
        document.getElementById('faq5').style.display = 'none';
    }
});
//end of button togglers

//function to make range num = range slider
document.getElementById('allowRange').addEventListener('change', function () {
    let val = document.getElementById('allowRange').value;
    document.getElementById('allowNum').value = val;
});
document.getElementById('allowNum').addEventListener('change', function () {
    let val = document.getElementById('allowNum').value;
    document.getElementById('allowRange').value = val;
});
document.getElementById('blockRange').addEventListener('change', function () {
    let val = document.getElementById('blockRange').value;
    document.getElementById('blockNum').value = val;
});
document.getElementById('blockNum').addEventListener('change', function () {
    let val = document.getElementById('blockNum').value;
    document.getElementById('blockRange').value = val;
});
//end of range slider fns

//two buttons to submit new user settings
//using a button instead of a submit to make the page not refresh
document.getElementById('urlSubmit').addEventListener('click', function (e) {
    let url = document.getElementById('url input').value;
    chrome.storage.sync.set({ userInput: ['new url', url] });
    //need to make fn wait just a second for the url to get registered before refreshing settings display
    setTimeout(function () {
        document.getElementById('url input').value = null;
        makeVisible('User Settings');
        populateSettings();
    }, 50);
});
document.getElementById('timeSubmit').addEventListener('click', function (e) {
    let timeAllow = document.getElementById('allowRange').value;
    let timeBlock = document.getElementById('blockRange').value;
    chrome.storage.sync.set({ userInput: ['new times', timeAllow, timeBlock] });
});


//need function to populate user settings
function populateSettings() {

    chrome.storage.sync.get(['syncCache'], function (x) {
        let set = x.syncCache.dynamicIds;
        let update = '';
        for (let i = 1; i < set.length; i++) {
            //gotta start on 1 because there's no 0th value
            if (set[i] !== null) {
                update += `${i}. ${set[i]} <button id='delete url' value='${set[i]}'> delete url </button> <br>`;
            }
        }
        document.getElementById('user settings p').innerHTML = update;
        addDeleteListener(); //add listeners for delete now that there are elements w/ 'delete url'
    })
};
//test button to refresh the settings to see if it's working
document.getElementById('refresh settings').addEventListener('change', function () {
    makeVisible('User Settings');
    populateSettings();
});


//delete url button listener needs to pass url over to sync storage so service worker can remove it
//can't run before user settings is populated, so needs to be passed as a function into populateSettings
function addDeleteListener() {
    document.getElementById('delete url').addEventListener('click', function () {
        let ourObj = document.getElementById('delete url').value;
        chrome.storage.sync.set({ userDeletion: ['remove url', ourObj] });

        //now we just need to repopulate our list (probably after a short time delay)
        populateSettings();
    });
}
//this works

//hitting an error - can't add listener to null.
//Since this runs when the doc is created before there are any populated buttons?
//maybe have to put this explicitly into the user settings fn
