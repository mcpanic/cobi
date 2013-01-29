// Unit session moves at the visual (front-end) level
// These can be combined to form more complex operations.

var Conflicts = function() {
	// Initialize the sidebar with a default view 
	function initialize(){
	  	bindEvents();
	}

	function bindEvents(){

	}

    return {
        initialize: initialize
    };
}();       


	function clearConflictDisplay(){
		$(".slot .display").each(function(){
			$(this).html("");
		});


	}

     // Given an array of "conflicts", display the palette and count for each constraint in the "element"
     // Can be used both for individual sessions and entire rows
     function displayConflicts(conflicts, element){
          if (typeof conflicts === "undefined")
               return;
          element.html("");
          var conflicts_array = conflicts.map(function(co) {return co.type});
          
          // for each constraint, count and add a modal dialog with descriptions
          $.each(constraints_list, function(index, conflict){
               var filtered_array = conflicts_array.filter(function(x){return x==conflict.type});
               if (filtered_array.length > 0) {
                    var html = "";
                    var i;
                    for (i=0; i<filtered_array.length; i++) {
                         html += "<span class='conflict-display'></span>";
                    }
                    var $palette = $(html).css("background-color", conflict.color);
                    element.append(filtered_array.length).append($palette);
                    var palette_title = "Conflicts: " + conflict.label;
                    var palette_content = conflicts.map(function(co) {
                         if (co.type == conflict.type)
                              return "<li>"+co.description+"</li>";
                    }).join("");
                    $palette.popover({
                         html:true,
                         placement: "bottom",
                         trigger: "hover",
                         title:function(){
                              return palette_title;
                         },
                         content:function(){
                              return palette_content;
                         }
                    });
                    //$palette.popover();           
               }
          });
     }

     function displayConflictPreviewHTML(netCount) {
        var html = "";
        //for (var i=0; i<Math.abs(netCount); i++) {
            if (netCount > 0)
                html += "<span class='conflict-preview-added'></span>";
            else if (netCount < 0)
                html += "<span class='conflict-preview-removed'></span>";
        //}
        return html;
     }

     function displayConflictFullHTML(ment, input_array, conflict, sign) {
        if (input_array === null)
            return "";
        var html = "";
        //console.log(getConflictLength(input_array, conflict));
        var filtered_array = input_array == null? []: input_array.filter(function(x){return x.type==conflict.type});
        //if (filtered_array.length > 0)
        //	html += ment;
        for (var i=0; i<filtered_array.length; i++) {
            html += "<span class='conflict-preview-display'>" + sign + "</span>";
        }
        return html;
     }

     function getConflictLength(input_array, conflict) {
        var filtered_array = input_array == null? []: input_array.filter(function(x){return x.type==conflict.type});
        return filtered_array.length;
     }

     // Given a list of added and removed conflicts with a swap candidate,
     // display the preview to help make the decision to do the swap.
     function displayFullConflicts(swapValues, element){
          if (typeof swapValues === "undefined")
               return;

            var $session = $(".selected").first();
            var id = getID($session);  
            //console.log("HERE");
          element.find(".conflicts").html("");

          if (swapValues.value > 0)
          	element.find(".conflicts").append("<div class='swap-total-full stronger-text'>" + swapValues.value + " conflicts will be resolved.</div>");	
          else
          	element.find(".conflicts").append("<div class='swap-total-full weaker-text'>" + (-1)*swapValues.value + " conflicts will be added.</div>");	
          
          var filtered_array = [];          
          var isChanged = false;

          // for each constraint, count and add a modal dialog with descriptions
          $.each(constraints_list, function(index, conflict){  
            var html = displayConflictFullHTML("Added to source", swapValues.addedSrc, conflict, "+")
                + displayConflictFullHTML("Added to destination", swapValues.addedDest, conflict, "+")
                + displayConflictFullHTML("Removed from source", swapValues.removedSrc, conflict, "-")
                + displayConflictFullHTML("Removed from destination", swapValues.removedDest, conflict, "-");

            var netCount = getConflictLength(swapValues.addedSrc, conflict) + getConflictLength(swapValues.addedDest, conflict) 
                        - getConflictLength(swapValues.removedSrc, conflict) - getConflictLength(swapValues.removedDest, conflict);
            if (netCount == 0)
          		return;
          	isChanged = true;
            var $palette = $(html).css("background-color", conflict.color);
            var netCountClass = "conflict-netcount-added";
            if (netCount < 0)
                netCountClass = "conflict-netcount-removed";

            // var ment = "";
            // if (netCount > 0)
            //     ment += conflict.type + ": " + netCount + " conflicts will be resolved.";
            // else
            //     ment += conflict.type + ": " + (-1)*netCount + " conflicts will be added.";

            element.find(".conflicts")
                //.append("<div class='swap-total'>" + ment + "</div>")
                //.append("<div class='conflict-type-preview'/>")
                //.append("<span class='" + netCountClass + "'>" + addSign(netCount) + "</span>")
                .append($palette);             
          });
			if (!isChanged)
          		element.find(".swap-total-full").hide();
     }


     // Given a list of added and removed conflicts with a swap candidate,
     // display the preview to help make the decision to do the swap.
     function displayPreviewConflicts(swapValues, element){
          if (typeof swapValues === "undefined")
               return;

          if (swapValues.value > 0)
          	element.append("<div class='swap-total stronger-text'>" + addSign((-1)*swapValues.value) + "</div>");	
          else
          	element.append("<div class='swap-total weaker-text'>" + addSign((-1)*swapValues.value) + "</div>");	

          var filtered_array = [];          
          var isChanged = false;

          // for each constraint, count and add a modal dialog with descriptions
          $.each(constraints_list, function(index, conflict){  

            var netCount = getConflictLength(swapValues.addedSrc, conflict) + getConflictLength(swapValues.addedDest, conflict)
            			- getConflictLength(swapValues.removedSrc, conflict) - getConflictLength(swapValues.removedDest, conflict);
            if (netCount == 0) 
            	return;
            isChanged = true;
            var $palette = $(displayConflictPreviewHTML(netCount)).css("background-color", conflict.color);
            var netCountClass = "conflict-netcount-added";
            if (netCount < 0)
                netCountClass = "conflict-netcount-removed";
            
            var $inner = $("<div class='conflict-type-preview'/>")
            		.append($palette) 
            		.append("<span class='" + netCountClass + "'>" + addSign(netCount) + "</span>");
            element.append($inner);
                	
          });

          if (!isChanged)
          	element.find(".swap-total").hide();
     }

     // Refresh conflicts information display.
     // Called after an interaction occurs that affects conflicts. (swap, unschedule, schedule)
     function updateConflicts(){

        var conflict_count_array = {};
        $.each(constraints_list, function(index, conflict){
            conflict_count_array[conflict.type] = 0;
        });

        $(".slot").each(function(){
            var id = getID($(this));
            if (id !== -1) {
                displayConflicts(conflictsBySession[id], $(this).find(".display"));
                var conflicts_array = conflictsBySession[id].map(function(co) {return co.type});          
                    // for each constraint, count and add a modal dialog with descriptions
                    $.each(constraints_list, function(index, conflict){
                        var filtered_array = conflicts_array.filter(function(x){return x==conflict.type});
                        conflict_count_array[conflict.type] += filtered_array.length;             
                    });
            } else { // empty cells should clear the display
              $(this).find(".display").html("");
            }
        });         
        
        var total = 0;
        $.each(constraints_list, function(index, conflict){
            $("#list-constraints li").each(function(){
                if (conflict.type == $(this).data("type")){
                    $(this).find(".count").html(conflict_count_array[conflict.type]);
                    total += conflict_count_array[conflict.type];
                }
            });
        });

        $("#constraints-count").html(total);
     }