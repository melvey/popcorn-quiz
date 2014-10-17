#Popcorn quiz plugin#
A plugin for the popcorn.js library to prompt a viewer with a question that must be answered to continue viewing the video.
When a question is shown the video is paused and an overlay is shown over the video with the question. The user must answer the question correctly to continue. The plugin currently The plugin permits both radio buttons and text input as specified in the type parameter. If undefined it will default to a text input. 

Example
========
```js`
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
````

Options
=======
| Name | Type | Default | Description |
| ---- |:----:|:-------:|:----------- |
| start | int | none | The time in the video to show this questions |
| type | string | text | The type of answer input to display. Valid options are 'text' and 'radio' |
| id | string | random | The DOM ID to apply to the video overlay |
| question | string | none | The question text to display to users |
| answers | array | none | Answers to be displayed for radio buttons and correct answers for a text input |

Requirements
=============
- [PopcornJS](http://popcornjs.org/) (The plugin has been developed using version 1.5.6)
- [Bootstrap3](http://getbootstrap.com/) is used to style the question form. It is not required and custom styles may be used.