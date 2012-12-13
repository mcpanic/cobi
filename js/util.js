	function getRandomColor(){
		return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
	}


	function getSessionNumSubmissions(submissions){
		var key, count = 0;
		for (key in submissions){
			count++;
		}
		return count;
	}


	function shortenDate(date){
	  var str = "";
	  if (date == "May 7, 2012")
	       str = "MON 5/7";
	  else if (date == "May 8, 2012")
	       str = "TUE 5/8";
	  else if (date == "May 9, 2012")
	       str = "WED 5/9";
	  else if (date == "May 10, 2012")
	       str = "THU 5/10";
	  return str; 
	}	


	function swapNodes(a, b) {
		var aparent= a.parentNode;
		var asibling= a.nextSibling===b? a : a.nextSibling;
		b.parentNode.insertBefore(a, b);
		aparent.insertBefore(b, asibling);
	}


     function getLength(item) {
          if (item === null || typeof item === "undefined")
               return 0;
          else 
               return item.length;
     }

          
	// Retrieve ID from a cell
	// Returns -1 when it doesn't exist.
	function getID(cell){
		if (typeof cell.attr("id") === "undefined")
			return -1;
		// substr(8) because we are adding "session-" in front of the ID
		return cell.attr("id").substr(8);
	}


	// Add an alert message at the very top of the page
	function displayAlert(message){
		$("#alert").html("<div class='alert alert-success'>"
		//+ "<button type='button' class='close' data-dismiss='alert'>×</button>"
		+ "<strong>" + message + "</strong>."
		+ "</div>");
		$("#alert .alert").delay(10000).fadeOut("slow", function () { $(this).remove(); });

	}