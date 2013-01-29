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

// HQ: added new durartion function
function getSessionDuration(submissions){
    var key, count = 0;
    for (key in submissions){
	if(submissions[key].type == "TOCHI"){
	    count += 20;
	}else if(submissions[key].type == "paper"){
	    if(submissions[key].subtype = "Note"){
		count += 10;
	    }else{ // paper
		count += 20;
	    }
	}else if(submissions[key].type == "panel"){
	    count += 80;
	     }else if(submissions[key].type == "SIG"){
	    count += 80;
	}else if(submissions[key].type == "course"){
	    count += 80;
	}else if(submissions[key].type == "casestudy"){
	    count += 20;
	}
    }
    return count;
}


function shortenDate(date){
	/*
	var str = "";
	
	if (date == "May 7, 2012")
	   str = "MON 5/7";
	else if (date == "May 8, 2012")
	   str = "TUE 5/8";
	else if (date == "May 9, 2012")
	   str = "WED 5/9";
	else if (date == "May 10, 2012")
	   str = "THU 5/10";
	*/
	return date.substring(0,3); 
}	

 function getLength(item) {
      if (item === null || typeof item === "undefined")
           return 0;
      else 
           return item.length;
 }

function addSign(val){
	if (val > 0)
		return "+" + val;
	else
		return val;
}   


// Locate an empty session by its date, time, and room
// Returns null when there is no such cell that's empty.
function findCellByDateTimeRoom(cellDate, cellTime, cellRoom){
    var cell = null;
    $("#program .empty").each(function(){
        //console.log($(this).data("date"), $(this).data("time"), typeof $(this).data("room"), typeof cellRoom, $(this).data("room") == cellRoom, $(this).data("room") === cellRoom);
        if ($(this).data("date") == cellDate && $(this).data("time") == cellTime  && $(this).data("room") == cellRoom)
            cell = $(this);
    });
    return cell;
}

// return a frontend cell with given ID
function findCellByID(id) {
    return $("#session-" + id); 
    /*
    $cell = null;
    $(".slot:not('.unavailable')").each(function(){
        if ($(this).attr("id").substr(8) == id)
            $cell = $(this);
    });
    return $cell;
    */
}

// Retrieve ID from a cell
// Returns -1 when it doesn't exist.
function getID(cell){
	if (typeof cell.attr("id") === "undefined")
		return -1;
	// substr(8) because we are adding "session-" in front of the ID
	return cell.attr("id").substr(8);
}

// Check if this cell has any special cell status class applied, which change the background color of the cell. (selected, recommended, ...)
function isSpecialCell($item){
	if ($item.hasClass("selected") || $item.hasClass("move-src-selected") || $item.hasClass("recommended"))
		return true;
	else
		return false;
}
