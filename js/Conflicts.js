// Unit session moves at the visual (front-end) level
// These can be combined to form more complex operations.

var Conflicts = function() {
	// Initialize the sidebar with a default view 
	function initialize(){
	  	bindEvents();
	}

	function bindEvents(){
        $(document).on("click", ".conflict-preview-display", conflictPreviewDisplayHandler);
	}

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
        var $view;
            if (netCount > 0)
                $view = $("<span/>").addClass("conflict-preview-added");
            else if (netCount < 0)
                $view = $("<span/>").addClass("conflict-preview-removed");
            else
                $view = $("<span/>");
        return $view;
     }


    // show details for a conflict added / removed when a +/- icon is clicked.
    function conflictPreviewDisplayHandler(event){
        $(this).closest(".conflicts").find(".conflict-preview-detail").html($(this).attr("data-content")).show();
    }

     function displayConflictFullHTML(ment, input_array, conflict, sign) {
        var $view = $("<span/>");
        // if (input_array === null)
        //     return $("<span/>");
        
        var filtered_array = input_array == null? []: input_array.filter(function(x){return x.type==conflict.type});
        for (var i=0; i<filtered_array.length; i++) {
            // html += "<span class='conflict-preview-display'>" + sign + "</span>";
            console.log(ment, conflict.label, filtered_array[i].description);
            $("<span/>")
                    .addClass("conflict-preview-display").html(sign)
                    .attr("data-html", "true")
                    .attr("data-title", ment)
                    .attr("data-trigger", "manual")
                    .attr("data-content", "<strong>Type: " + conflict.label + "</strong><br>" + filtered_array[i].description)
                    // .popover({
                    //     html:true,
                    //     title: ment,
                    //     trigger: "hover",
                    //     html: "Type: " + conflict.label + "<br>" + filtered_array[i].description
                    // })
                    .css("background-color", conflict.color)
                    .appendTo($view);
        }

        return $view;
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
          var plural = isPlural(swapValues.value) ? "s" : "";
          if (swapValues.value > 0)
            element.find(".conflicts").append("<div class='swap-total-full stronger-text'>" + swapValues.value 
              + " conflict" + plural 
              + " will be resolved. <small>(click icons for details)</small></div>"); 
          else
            element.find(".conflicts").append("<div class='swap-total-full weaker-text'>" + (-1)*swapValues.value 
                + " conflict" + plural 
                + " will be added. <small>(click icons for details)<small></div> "); 
                
          var isChanged = false;

          // for each constraint, count and add a modal dialog with descriptions
          $.each(constraints_list, function(index, conflict){  
            var netCount = getConflictLength(swapValues.addedSrc, conflict) + getConflictLength(swapValues.addedDest, conflict) 
                        - getConflictLength(swapValues.removedSrc, conflict) - getConflictLength(swapValues.removedDest, conflict);
            if (netCount == 0)
                 return;
            // console.log(conflict, swapValues);
            isChanged = true;
            
            var $view = element.find(".conflicts");
            if (swapValues.addedSrc != null)
                $view.append(displayConflictFullHTML("Adding a conflict", swapValues.addedSrc, conflict, "+"));
            if (swapValues.addedDest != null)
                $view.append(displayConflictFullHTML("Adding a conflict", swapValues.addedDest, conflict, "+"))
            if (swapValues.removedSrc != null)
                $view.append(displayConflictFullHTML("Resolving a conflict", swapValues.removedSrc, conflict, "-"))
            if (swapValues.removedDest != null)
                $view.append(displayConflictFullHTML("Resolving a conflict", swapValues.removedDest, conflict, "-"));      
            // var netCountClass = "conflict-netcount-added";
            // if (netCount < 0)
            //     netCountClass = "conflict-netcount-removed";            
          });
            if (!isChanged)
              element.find(".swap-total-full").hide();
          var $detail = $("<div/>").addClass("conflict-preview-detail").hide();
          element.find(".conflicts").append($detail);
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
                if (conflict.type == $(this).attr("data-type")){
                  // Pairwise counted as 1
                    $(this).find(".count").html(Math.round(conflict_count_array[conflict.type]/2));
                    total += conflict_count_array[conflict.type];
                }
            });
        });

        $("#constraints-count").html(Math.round(total/2));
     }

    return {
        initialize: initialize,
        clearConflictDisplay: clearConflictDisplay,
        // displayConflicts: displayConflicts,
        // displayConflictPreviewHTML: displayConflictPreviewHTML,
        // displayConflictFullHTML: displayConflictFullHTML,
        // getConflictLength: getConflictLength,
        displayFullConflicts: displayFullConflicts,
        displayPreviewConflicts: displayPreviewConflicts,
        updateConflicts: updateConflicts
    };
}();       


