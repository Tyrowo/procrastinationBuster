# procrastinationBuster

To use this extension without downloading it from the store:

download the zip file from this repository and unzip it

open a new chrome tab

enter chrome://extensions

turn on the developer mode slider in the top right corner of the screen

click "load unpacked" in the top left corner of the screen

navigate to where you downloaded this project and select the folder

The extension will create a new tab explaining how to use the extension. i.e. how to input urls and change time settings in your user settings section of the options page

__________________________________________________________________________________________

a chrome extension that prevents from going back to that website that eats up all your time.

The intent for this project is to become more familiar with chrome extension development, as well as create my first real project here on github.

The idea is fairly simple and has probably been done a million times, but in that simplicity I think is the elegance and perfect way to start.

There are currently 6 theoretical components to the extension necessary for implementation- 

1. user preferences to state which websites you want to avoid going to, and how infrequently you want to not go to it (in minutes)
2. the extension has a monitor for when you input the website into your browser
3. the extension sets two alarms - one for how long you're allowed to visit the site, and one for when you'll be allowed back on, based on your preference settings
4. any time you try to visit your restricted sites during the disallowed period you are prohibited from entering them. 

You can restrict up to 10 sites and remove them in your user settings page in the optionspage by clicking on the extension icon.

are you supposed to put a date on these readme files?
updated 8/23/2021
