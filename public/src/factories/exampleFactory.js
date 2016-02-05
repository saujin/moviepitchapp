moviePitchApp.factory('exampleFactory', function($q){
	const pitches = [
	  {
	    "title": "GROUNDHOG DAY",
	    "pitch": "A comedy about a down-on-his-luck weatherman, who finds himself doomed to repeat the same day over and over over again."
	  },
	  {
	    "title": "HOME ALONE",
	    "pitch": "When a family goes on vacation, they accidentally leave one of their children behind. Now, it's up to this 10-year old boy to defend his home from two bumbling burglars."
	  },
	  {
	    "title": "SPLASH",
	    "pitch": "A romantic comedy about what happens when a man falls in love with the perfect girl... who just happens to be a mermaid."
	  },
	  {
	    "title": "THREE MEN AND A BABY",
	    "pitch": "Three swinging bachelors are forced to take care of a newborn baby."
	  },
	  {
	    "title": "MEET THE PARENTS",
	    "pitch": "Comedy that deals with what happens when a young man must meet his girlfriend's parents for the first time, and begins to crack under the pressure of trying to impress and get along with her family... In the process, he almost ruins his chance to marry the girl of his dreams."
	  },
	  {
	    "title": "TOOTSIE",
	    "pitch": "A struggling actor realizes that if he can't get a job as an 'actor'... he will dress up as a woman, and try to have better luck as an 'actress.'' The problem is... he suddenly finds himself becoming a famous 'actress' and his deception becomes harder to maintain. (Especially when he finds himself falling in love with a beautiful actress who doesn't know he's really a man.)"
	  },
	  {
	    "title": "IT'S A WONDERFUL LIFE",
	    "pitch": "A classic story that asks the question: 'How would the world be different if you had never been born in the first place?' In this movie, our hero has the chance to discover that his life, and everyone else's, really do make a difference. (Every life has meaning.)"
	  },
	  {
	    "title": "THE GRADUATE",
	    "pitch": "Comedy about a young man who has a big dilemma: how do you tell the woman you've fallen in love with that you've been sleeping with her mother?"
	  },
	  {
	    "title": "BIG",
	    "pitch": "A young boy makes a wish to be 'big' and he discovers the next morning his wish has come true. He's now in the body of an adult, but 'inside' he's still a 10-year old kid. He's about to discover that being 'big' isn't always so great, i.e. 'be careful what you wish for.'"
	  },
	  {
	    "title": "NEIGHBORS",
	    "pitch": "A young couple with their newborn baby moves into a quiet neighborhood... only to discover they're now living next-door to an ANIMAL HOUSE-like fraternity. The couple decides to do anything they can to get rid of the frat house."
	  },
	  {
	    "title": "TAKEN",
	    "pitch": "When his daughter is kidnapped, a retired CIA agent is forced to track down the kidnappers and rescue his daughter."
	  },
	  {
	    "title": "MALEFICENT",
	    "pitch": "The classic fairy tale of SLEEPING BEAUTY is retold from the point-of-view of the villainous character Maleficent."
	  },
	  {
	    "title": "SHAKESPEARE IN LOVE",
	    "pitch": "When William Shakespeare suffers from crippling writer's block... he's lucky enough to meet a beautiful young woman, who he falls in love with, and is inspired by her to write the classic ROMEO AND JULIET."
	  },
	  {
	    "title": "YOU'VE GOT MAIL",
	    "pitch": "Two people who dislike each other begin to communicate anonymously online... and fall in love."
	  },
	  {
	    "title": "WHAT WOMEN WANT",
	    "pitch": "A cynical advertising exec suddenly develops the power to read women's thoughts."
	  },
	  {
	    "title": "THE HANGOVER",
	    "pitch": "After a wild bachelor party in vegas, three friends wake up to find the groom is missing, and no one has any memory of the previous night."
	  },
	  {
	    "title": "BACK TO THE FUTURE",
	    "pitch": "In 1985, Doc Brown invents time travel. Marty McFly travels back to 1955 and accidentally prevents his parents from meeting, putting his own existence in jeopardy."
	  },
	  {
	    "title": "SPEED",
	    "pitch": "There's a bomb on a crowded city bus... and if the bus slows below 50mph, the bomb will go off."
	  },
	  {
	    "title": "LIAR LIAR",
	    "pitch": "A lawyer suddenly loses his ability to lie."
	  },
	  {
	    "title": "THE GRADUATE",
	    "pitch": "A comedy that asks the question: how do you tell the girl you're in love with that you've been sleeping with her mother?"
	  },
	  {
	    "title": "SHAKESPEARE IN LOVE",
	    "pitch": "Shakespeare has writer's block, but meets a beautiful woman who inspires him to write ROMEO & JULIET"
	  },
	  {
	    "title": "BIG",
	    "pitch": "A young boy makes a wish to be 'big' and wakes up to discover he's now in an adult body... but still a 10-year old kid."
	  },
	  {
	    "title": "THREE MEN AND A BABY",
	    "pitch": "Three swinging bachelors get stuck trying to take care of a newborn baby."
	  },
	  {
	    "title": "HOME ALONE",
	    "pitch": "A family goes on vacation, but accidentally leaves their young son behind. Now the 10-year old boy must defend his home from two bumbling burglars."
	  },
	  {
	    "title": "BRUCE ALMIGHTY",
	    "pitch": "What would you do if you could play God for a week?"
	  },
	  {
	    "title": "SPLASH",
	    "pitch": "Tom Hanks falls in love with a beautiful woman... who just happens to be a mermaid."
	  },
	  {
	    "title": "BREAKING BAD",
	    "pitch": "When an underemployed teacher in New Mexico is diagnosed with  cancer, he decides to pay for treatment by using his chemistry skills to cook the best  meth in town."
	  },
	  {
	    "title": "FROZEN",
	    "pitch": "A fearless princess sets off on an epic journey alongside a rugged iceman, his  loyal pet reindeer, and a naïve snowman to find her estranged sister, whose icy powers  have inadvertently trapped the kingdom in eternal winter."
	  },
	  {
	    "title": "SCHINDLER’S LIST",
	    "pitch": "The wartime experiences of ethnic German Oskar Schindler, who,  during the Holocaust, saved the lives of more than a thousand Polish Jews by employing  them in his factories."
	  },
	  {
	    "title": "FRIED GREEN TOMATOES",
	    "pitch": "A character‐driven comedy‐drama about the intertwining  lives of four southern women dealing with the Great Depression, abusive husbands, and  friendships that save their souls."
	  },
	  {
	    "title": "THE SOPRANOS",
	    "pitch": "Get inside the head of ruthless Mob boss Tony Soprano, who visits a  therapist as he juggles his two families."
	  },
	  {
	    "title": "IT’S COMPLICATED",
	    "pitch": "A successful divorcee starts an affair with a married man – her ex‐ husband – just as she’s starting to date again."
	  },
	  {
	    "title": "24",
	    "pitch": "Counter Terrorist Unit Agent Jack Bauer races against a real time clock as he  attempts to thwart terrorist plots, presidential assassinations, and worldwide  destruction. Each episode covers one hour in Jack Bauer’s day."
	  },
	  {
	    "title": "GREASE",
	    "pitch": "A musical love story set in 1950s Rydell High School, goodie two shoes Sandy  falls in love with high school bad boy Danny on summer vacation at the beach—only to  be surprised to find he’s head greaser of the T‐Birds gang at her new school. Will their  love survive a summer fling—and high school seniors?"
	  },
	  {
	    "title": "BAND OF BROTHERS",
	    "pitch": "The epic story of the Easy Company of the US Army’s 101st Airborne Division and their mission in World War II Europe from training through major  battles in Europe."
	  },
	  {
	    "title": "SIXTEEN CANDLES",
	    "pitch": "Sophomore Samantha Baker’s Sweet 16 is turning out to be  anything but: her entire family is focused on her older sister’s wedding the next day, and  her high school crush, Jake Ryan, has just found out she’s in love with him. Can anything  salvage this teenage nightmare?"
	  }
	];

	const factory = {
		getAllPitches: function(){
			let deferred = $q.defer();

			deferred.resolve({
				status: "success",
				pitches: pitches
			});

			return deferred.promise;
		}
	}

	return factory;
})