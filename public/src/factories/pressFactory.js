moviePitchApp.factory('PressFactory', function($q){
	const articles = [
		{
			title: "Meet Hollywood's Mr. Pitch",
			subtitle: "Robert Kosberg has made a career out of pitching in-your-face ideas for movies. Have you heard his pitch for a horror film about a rampaging dog? Think 'Jaws on paws.'' Why not let him direct your next pitch?",
			url: "http://www.fastcompany.com/38665/meet-hollywoods-mr-pitch"
		},
		{
			title: "Talking with Bob Kosberg",
			subtitle: "Talking with Bob Kosberg -- Here's why everyone's buying what Hollywood's fastest talker has to sell.",
			url: "http://www.ew.com/article/2006/07/28/talking-bob-kosberg"
		},
		{
			title: "‘Extra!’ base hit for pair",
			subtitle: "DreamWorks has preemptively bought the pitch “Extra! Extra!” by scribes Bobby Florsheim and Josh Stolberg (“The Passion of the Ark”) for Robert Kosberg to produce.",
			url: "https://variety.com/2005/film/reviews/extra-base-hit-for-pair-1117924064/"
		},
		{
			title: "The Art of Selling Ideas",
			subtitle: "A few moments with Bob Kosberg, Hollywood idea man and pitch master.",
			url: "http://www.flightofideas.net/Articles/Quest%20-%20The%20Art%20of%20Selling%20Ideas%20-%20By%20Bob%20Kodzis%20Jan%20Feb%202008.pdf"
		},
		{
			title: "Concept is King",
			subtitle: "In today's tight spec-script market, nothing is more important than your idea.",
			url: "http://www.scriptmag.com/features/concept-is-king"
		},
		{
			title: "The Pitch Guy",
			subtitle: "Some people carve out a career writing screenplays. Others get rich bringing them to life onscreen. Then there’s Robert Kosberg. His specialty? Ideas.",
			url: "http://www.lamag.com/longform/the-pitch-guy/"
		},
		{
			title: "It's the Pitch, Stupid!",
			subtitle: "An interview with Robert Kosberg.",
			url: "http://www.absolutewrite.com/screenwriting/robert_kosberg.htm"
		}
	];

	const factory = {
		getArticles: function(){
			let deferred = $q.defer();

			deferred.resolve({
				status: "success",
				articles: articles
			});

			return deferred.promise;
		}
	};

	return factory;
});