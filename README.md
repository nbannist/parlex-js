#parlex-js

A Parser and Lexer in Javascript, which uses the state machine setup from Rob Pike's talk on the parser/lexer used in the templating system in the Go programming language.

 * YouTube video: http://www.youtube.com/watch?v=HxaD_trXwRE (51 min)
 * Slides: http://rspace.googlecode.com/hg/slide/lex.html#landing-slide

##Why the name?

"Parlex" is a combination of shortened forms of "Parser" and "Lexer", which is what the software will do eventually and is a play on the word "Parlance" (synonyms: language, tongue, speech). The "-js" just cues people in to the fact that this is written in Javascript. If all goes well, I plan on doing a version in another language too.

It was either that or "Pretty State Machine" but I wasn't sure if enough people would connect it to the NIN album.

It's fun to play with words.

##Setup/Installation

Setup information.

##Documentation

None yet.

###Idea for Simple Usage

Should be very easy. But the machine needs the text to work on, the state functions, Item types,...parser is completely optional.

###Idea for Web Worker Usage

A bit more complicated but allows lexer and parser to be run in parralel or in series as background tasks.
Lexer passes items to Parser as they are lexed (or all items after lexer has completed) using Web Worker messages (onmessage and postMessage). Items are just simple javascript objects: {type: <number>, value: <string>}.

Machines will have methods that execute when each part is finished. Need to have the ability to add callback functions, otherwise you won't easily know when the machines are finished doing what they are doing.

##Version History

Pre-Alpha
 * 2013.02.22_01 - Initial Submission; Just a README.md (this file)
 * 2013.02.24_01 - Added:
    - Quint (unit testing)
    - Skeleton of the StringStateMachine object with some helper functions (No State Function helpers yet).
	- Added Custom Events to fire before and after each state function has run (this will be an option later).



##Thanks

Thanks to Rob Pike for giving the talk and posting a video of it and the slides he used. Learned a lot! Thanks!


Cheers,

Nicholas
