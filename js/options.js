var constraints_list = [
	{
		"id": "1",
		"label": "no simultaneous sessions for an author",
		"color": "#a55194",
		"type": "authorInTwoSessions" 
	},
	{
		"id": "2",
		"label": "no simultaneous sessions for a persona",
		"color": "#2ca02c",
		"type": "personaInTwoSessions"
	}/*,
	{
		"id": "3",
		"label": "constraint 3",
		"color": "#F1F0FF"
	},
	{
		"id": "4",
		"label": "constraint 4",
		"color": "#8C489F"  
	},
	{
		"id": "5",
		"label": "constraint 5",
		"color": "#008888"
	}	*/			
];
/*
var personas_list = [
{"id": "uist", "label": "UIST", "color": "#443266"},
{"id": "social", "label": "Social", "color": "#C3C3E5"},
{"id": "design", "label": "Design", "color": "#F1F0FF"},
{"id": "game", "label": "Game", "color": "#8C489F"}, 
{"id": "ict4d", "label": "ICT4D", "color": "#008888"}
];
*/
var options_list = [
{"id": "conflicts", "label": "Conflicts"}, 
{"id": "session-type", "label": "Session Type"}, 
{"id": "popularity", "label": "Popularity"}, 
{"id": "num-papers", "label": "Number of Papers"}, 
{"id": "duration", "label": "Duration"}, 
{"id": "awards", "label": "Awards"}, 
{"id": "honorable-mentions", "label": "Honorable Mentions"},
{"id": "persona", "label": "Persona"}
];

var color_palette_1 = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", 
"#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", 
"#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", 
"#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"]