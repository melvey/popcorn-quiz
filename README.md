#Popcorn quiz plugin#
Developed for Charles Darwin University by Matthew Elvey (Matthew.Elvey@cdu.edu.au)
Created using popcorn.js version 1.5.6
Updated 6/10/14
 
Pause the video and prompt a user with a question overlayed over the video. The user must answer the question corretly to contine
The plugin permits both radio buttons and text input as specified in the type parameter. If undefined it will default to a text input. 
*
Example:
	var popcorn = Popcorn("#video_player")
	.quiz({
		start: 20,
		type: 'radio',
		id: 'firstquiz',
		question: 'Does this quiz work?',
		answers: [
			{value:'Y', text:'Yes', correct:true},
			{value:'N', text:'No', correct:false},
		],
	});
*
This plugin has been designed to use bootstrap3 for form and alert styling but does not required it. 
