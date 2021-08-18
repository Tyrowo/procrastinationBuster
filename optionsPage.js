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
