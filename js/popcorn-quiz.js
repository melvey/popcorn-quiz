/**
* Popcorn quiz plugin
* Developed for Charles Darwin University by Matthew Elvey (Matthew.Elvey@cdu.edu.au)
* Created using popcorn.js version 1.5.6
* Updated 6/10/14
* 
* Pause the video and prompt a user with a question overlayed over the video. The user must answer the question corretly to contine
* The plugin permits both radio buttons and text input as specified in the type parameter. If undefined it will default to a text input. 
* Example:
*	var popcorn = Popcorn("#video_player")
*	.quiz({
*		start: 20,
*		type: 'radio',
*		id: 'firstquiz',
*		question: 'Does this quiz work?',
*		answers: [
*			{value:'Y', text:'Yes', correct:true},
*			{value:'N', text:'No', correct:false},
*		],
*	});
* This plugin has been designed to use bootstrap3 for form and alert styling but does not required it. 
*/
Popcorn.plugin('quiz', function(options) {
	var popcorn = this, 
		submit, 				// Submit input button to submit answers
		overlay,				// Div DOM object the overlay video and contain the questions
		quizForm, 				// The form DOM object
		answered = false,		// Has this questions been answered as yet?
		options,				// Options passed to plugin
		alertNotice, 			// Currently displayed alert div
		marker,					// Marker on timeline (if set)
		caseSensitive = true,	// Is the answer case sensitive
		question; 				// Question paragraph tag
		
	/**
	* Event handler for video seek
	* Check if the video has seeked past the unanswered question. If so jump back to show the question
	*/
	function seeked(evt) {
		// If the user has scanned past the question but hasn't answered it yet go back
		if(popcorn.video.currentTime > options.start && answered == false) {
			popcorn.video.currentTime = options.start;
			console.log("User seeked past video");
		} else if (popcorn.video.currentTime < options.start) {
			// If we are currently showing the video and we have scanned back hide it
			// This is important to avoid fighting with earlier questions that may want to take control
			overlay.style.display = 'none';
//			popcorn.play();
			console.log("Seeked before video so ensure we are hidden");
		}
	}
	

	/**
	* Event handler for submit button
	* Check the selected answer against the answer array. Display a message and continue if correct
	*/
	function submitted() {
		// Handle response from the video
		var answer, inputs, valid, i;
		valid = false;
		
		switch(options.type) {
			case 'radio':
				// Get answer from radio boxes
				inputs = document.getElementsByName(options.id+'_answer');
				console.log(inputs);
				for(i = 0; i< inputs.length; i++) {
					if(inputs[i].checked) {
						answer = inputs[i].value;
					} 
				}
				break;
			case 'text':
				answer = document.getElementById(options.id+'_input').value;
				break;
				
			default:
				throw new Exception('Invalid quiz question type: '+options.type);
		}
		console.log(answer);
		
		// Compare answer to options specified
		for(i=0; i<options.answers.length; i++) {
			if(options.answers[i].correct) {
				if((options.caseSensitive === true || options.caseSensitive === undefined) && options.answers[i].value === answer) {
					valid = true;
					break;
				} else if(options.caseSensitive === false && options.answers[i].value.toUpperCase() === answer.toUpperCase()) {
					valid = true;
					break;
				}
			}
		}
		
		// Clear any existing alerts
		if(alertNotice && alertNotice.parentNode == overlay) {
			overlay.removeChild(alertNotice);
			alertNotice = null;
		}
		if(valid) {
			answered = true;
			
			alertNotice = document.createElement('p');
			alertNotice.setAttribute('class', 'alert alert-success');
			alertNotice.setAttribute('role', 'alert');
			alertNotice.innerHTML = 'Correct';
			overlay.appendChild(alertNotice);
			
			setTimeout(function() {
				if(marker) {
					marker.setAttribute("class", "quiz_marker quiz_complete");
				}
				overlay.style.display = 'none';
				overlay.removeChild(alertNotice);
				alertNotice = null;
				popcorn.play();
			}, 1000);
		} else {
			alertNotice = document.createElement('p');
			alertNotice.setAttribute('class', 'alert alert-danger');
			alertNotice.setAttribute('role', 'alert');
			alertNotice.innerHTML = 'Incorrect';
			overlay.appendChild(alertNotice);
		}
		
		return false;
	}
	
	/**
	* Draw a marker on the timeline indicating where the question is
	*/
	function addMarker(timelineSelector) {
		if(isNaN(popcorn.duration())) {
			setTimeout(function() {
				console.log("Duration is not loaded so waiting a second to try again");
				addMarker(timelineSelector);
			},1000);
		} else {
			marker = document.createElement("span");
			marker.setAttribute("class", "quiz_marker quiz_incomplete");
			var timePercent = (options.start / popcorn.video.duration * 100);
			marker.style.marginLeft = timePercent + '%';
//			marker.style.marginRight = (99-timePercent)+'%';
			marker.style.width = '0.5%';
			var timelineElement = document.querySelector(options.timeline);
			if(timelineElement) {
				timelineElement.appendChild(marker);
			}		
		}
	}
	
	
	return {
		manifest: {
			about: {
				name: "Interactive video quiz",
				version: '0.1.0',
				author: 'Elvey'
			},
			options: {
				start: {elem: 'input', type: 'text', label: 'In'},
				id: {elem: 'input', type: 'text', label: 'ID for question'},
				type: {elem: 'input', type:'text', label: 'Input type for quiz'},
				question: {elem: 'input', type: 'text', label: 'Question text'},
				answers: {elem: 'input', type: 'array', label: 'Answers'},
				caseSensitive: {elem: 'input', type: 'boolean', label: 'Case sensitive matching for answer'}
			}
		},
		_setup: function(options) {
		
			// If the ID is not set create a random ID
			if(!options.id) {
				options.id = Math.random().toString(36);
			}
			// Default to text input
			if(!options.type) {
				options.type = 'text';
			}
			
			// Default to case sensitive input
			if(options.caseSensitive === undefined) {
				options.caseSensitive = true;
			}
			
			// Create the overlay div
			overlay = document.createElement('div');
			overlay.setAttribute('id', 'quiz_'+options.id);
			overlay.setAttribute('class', 'quiz_overlay');
			overlay.style.position = 'absolute';
			overlay.style.display = 'none';
			
			// Create form for quiz
			quizForm = document.createElement('form');
			quizForm.setAttribute('id', options.id);
			quizForm.setAttribute('class', 'quiz-form form-horizontal');
			quizForm.setAttribute('role', 'form');
			overlay.appendChild(quizForm);
			
			// Create question text and add to form
			question = document.createElement('p');
			question.setAttribute('class', 'question_text');
			question.innerHTML = options.question;
			quizForm.appendChild(question);
			
			// Add answer input
			switch(options.type) {
				case 'radio':
					var answerCount = 0;
					options.answers.forEach(function(answer) {
						var div, input, inputID, label;
						input = document.createElement('input');
						input.setAttribute('type', 'radio');
						input.setAttribute('value',answer.value);
						inputID = options.id+'_'+answerCount;
						input.setAttribute('id', inputID);
						input.setAttribute('name', options.id+'_answer');
						label = document.createElement('label');
						label.setAttribute('for', inputID);
						label.innerHTML = label.innerHTML + answer.text;
						
						div = document.createElement('div');
						div.setAttribute('class', 'radio');
						div.appendChild(input);
						div.appendChild(label);
						quizForm.appendChild(div);

						answerCount++;
					});
					break;
				case 'text':
					var input = document.createElement('input');
					input.setAttribute('type', 'text');
					input.setAttribute('id', options.id+'_input');
					
					var div = document.createElement('div');
					div.setAttribute('class', 'form-group');
					div.appendChild(input);
					quizForm.appendChild(div);
					break;
				default:
					throw new Exception('Invalid quiz question type: '+options.type);
			} 
			
			// Add submit button
			submit = document.createElement('button');
			submit.setAttribute('onClick', 'return false;')
			submit.setAttribute('class', 'btn btn-primary');
			submit.innerHTML = 'Submit';
			submit.addEventListener('click', submitted, false);
			
			var div = document.createElement('div');
			div.setAttribute('class', 'form-group');
			div.appendChild(submit);
			quizForm.appendChild(div);
		
			// Add listener on scan to prevent user skipping the question
			popcorn.video.addEventListener('seeked', seeked);
			
			// Add marker if we have been given a timeline to draw it on
			if(options.timeline) {
				addMarker(options.timeline);
			}
			
		},
		start: function(event, track) {
			// Show quiz questions
			popcorn.pause();
			var rect = popcorn.video.getBoundingClientRect();
			overlay.style.top = rect.top+"px";
			overlay.style.right = rect.right+"px";
			overlay.style.bottom = rect.bottom+"px";
			overlay.style.left = rect.left+"px";
			overlay.style.width = popcorn.video.offsetWidth+"px";
			overlay.style.height = popcorn.video.offsetHeight+"px";
			overlay.style.display = 'block';
			document.body.appendChild(overlay);
		},
		end: function(event, track) {
			console.log("Ending");
			// Hide quiz
		},
		frame: function(event, track) {
			console.log("Frame");
		},
		_teardown: function(track) {
			// Remove all DOM elements and event listeners
			submit.removeEventListener('click', submitClick, false);
			document.removeChild(overlay);
		}
	};
});