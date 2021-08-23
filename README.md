# procrastinationBuster

To use this extension without downloading it from the store:
open a new chrome tab,
enter chrome://extensions
turn on the developer mode slider in the top right corner of the screen
click "load unpacked" in the top left corner of the screen
navigate to where you downloaded this project select the folder.
The extension should explain everything from there.

__________________________________________________________________________________________

a chrome extension that reprimands you from going back to that website that eats up all your time.

The intent for this project is to become more familiar with chrome extension development, as well as create my first real project here on github.

The idea is fairly simple and has probably been done a million times, but in that simplicity I think is the elegance and perfect way to start.

There are currently 6 theoretical components to the extension necessary for implementation- 

1. user preferences to state which website you want to avoid going to, and how infrequently you want to not go to it (hourly, half daily, daily), and if you want a warning or a full block
3. the extension has a monitor for when you input the website into your browser
4. it also has a counter or something to note the last time you visited and/or when you last visited.
5. the extension calculates whether your last visited time is within the infrequence duration 
6. after the second time you've visited within your infrequence preference, it creates an alert/full block on the site warning you when you last visited

other potential features for after alpha implementation-
 1. recording the number of times that you enter the website into your browser
 2. add multiple websites for busting

But that should be it. Simple, easy, to the point.
Hopefully by writing out those six tasks that it needs to be able to perform I can work on each soon and get them done quickly.
So far all I've done is read documentation on how to create the extension, but will update with a json manifest soon.

are you supposed to put a date on these readme files?
updated 6/25/2021
