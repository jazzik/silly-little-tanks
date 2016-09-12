# Silly Little Tanks
My entry for js13k 2016 competition, where main them was **Glitch**

## Game
You are a new QE ninja in your team. The team is going to release
new game (Silly Little Tanks) soon and your job is to find bugs
and provide repro steps for them, so dev team can fix them prior release.
So you need to play the game in order to find those bugs and provide as detailed
repro steps as possible. Earn points and improve your tank, so you can get
to higher levels as some bugs might not be so obvious to find.

## Controls
You are controlling red tank using WSAD or arrows. Use your mouse to rotate
the cabin and fire at other tanks.

## Note
For a long time now I wanted to try to create a game using just HTML elements
(and positioning them) as opposed to more conventional canvas solution.
As one could guess, it is not the best performant way, but it was too late for me to rewrite it to canvas solution,
so instead I implemented simple switches for graphics adjustments (please use
them if you find game unplayable - it can happen on older PCs, especially when there is
many elements - plus I created a lot of forced reflows towards the deadline which
I was not able to fix due to lack of time :( ).

## Note 2
In source code, there is js-readable folder and js folder. js-readable is the main development
folder, js folder contains some manual uglyfing work (like renaming public props, so I could save some more space).
Sadly towards the deadline they got bit out of sync and js folder has some more changes,
I will retype them to js-readable at some point :)

# Thanks
to **Markus Neubrand** for his jsfxr https://github.com/mneubrand/jsfxr
