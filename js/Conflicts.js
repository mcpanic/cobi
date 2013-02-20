// Unit session moves at the visual (front-end) level
// These can be combined to form more complex operations.

var Conflicts = function() {

    var constraintsList = [];

	// Initialize the sidebar with a default view 
	function initialize(){
        updateConstraintsList();
	  	bindEvents();
	}

    // From CCOps.allConstraints, get all existing contraints existing in the data.
    // TODO: when constraint types are added as a transaction, handle them dynamically here, working with Polling.js
    function updateConstraintsList(){
        var typeHash = {};
        $.each(CCOps.allConstraints, function(index, c){
            if (c.type in typeHash) 
                return;
            typeHash[c.type] = c.type;

            var constraint = {};
            constraint.id = index;
            constraint.description = c.description;
            constraint.color = "#913A52";
            // TODO: make it more reasonable
            if (c.importance < -5) {
                constraint.severity = "high";
            } else
                constraint.severity = "medium";
            constraint.importance = c.importance;
            constraint.type = c.type;
            Conflicts.constraintsList.push(constraint);
        });
        //Conflicts.constraintsList.sort(function(a,b){ return a.importance > b.importance; });
        console.log(CCOps.allConstraints, Conflicts.constraintsList);        
    }

	function bindEvents(){
        $(document).on("click", ".conflict-preview-display", conflictPreviewDisplayHandler);
	}

    function clearConflictDisplay(){
        $(".slot .display").each(function(){
            $(this).html("");
        });
        $(".slot .conflicts").each(function(){
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
          $.each(Conflicts.constraintsList, function(index, conflict){
               var filtered_array = conflicts_array.filter(function(x){return x==conflict.type});
               if (filtered_array.length > 0) {
                    var html = "";
                    var i;
                    for (i=0; i<filtered_array.length; i++) {
                         html += "<span class='conflict-display'></span>";
                    }
                    var $palette = $(html).addClass("cell-conflict-" + conflict.severity)
                    //.css("background-color", conflict.color);
                    element.append(filtered_array.length).append($palette);
                    var palette_title = "Conflicts: " + conflict.description;
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
        $(".conflict-preview-display").removeClass("conflict-selected");
        $(this).addClass("conflict-selected");
        $(this).closest(".conflicts").find(".conflict-preview-detail").html($(this).attr("data-content")).show();
    }

     function displayConflictFullHTML(ment, inputArray, conflict, sign) {
        var $view = $("<span/>");
        // if (inputArray === null)
        //     return $("<span/>");
        
        var filteredArray = inputArray == null? []: inputArray.filter(function(x){return x.type==conflict.type});
        // console.log(ment, inputArray, conflict, sign);
        for (var i=0; i<filteredArray.length; i++) {
        //for (var i=0; i<inputArray.length; i++) {
            $("<span/>")
                    .addClass("conflict-preview-display").html(sign)
                    .attr("data-html", "true")
                    .attr("data-title", ment)
                    .attr("data-trigger", "manual")
                    .attr("data-content", "<strong>" + ment + "</strong><br><strong>Type: " + conflict.description + "</strong><br>" + filteredArray[i].description)
                    // .popover({
                    //     html:true,
                    //     title: ment,
                    //     trigger: "hover",
                    //     html: "Type: " + conflict.label + "<br>" + filteredArray[i].description
                    // })
                    .css("background-color", conflict.color)
                    .appendTo($view);
        }

        return $view;
     }

     function getConflictLength(inputArray, conflict) {
        var filtered_array = inputArray == null? []: inputArray.filter(function(x){return x.type==conflict.type});
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
          $.each(Conflicts.constraintsList, function(index, conflict){  
            // var netCount = getConflictLength(swapValues.addedSrc, conflict) + getConflictLength(swapValues.addedDest, conflict) 
            //             - getConflictLength(swapValues.removedSrc, conflict) - getConflictLength(swapValues.removedDest, conflict);
            // if (netCount == 0)
            //      return;
            // console.log(conflict, swapValues);
            isChanged = true;
            
            var $view = element.find(".conflicts");
            if (swapValues.addedSrc != null && swapValues.addedSrc.length > 0)
                $view.append(displayConflictFullHTML("[Conflict added]", swapValues.addedSrc, conflict, "+"));
            if (swapValues.addedDest != null && swapValues.addedDest.length > 0)
                $view.append(displayConflictFullHTML("[Conflict added]", swapValues.addedDest, conflict, "+"))
            if (swapValues.removedSrc != null && swapValues.removedSrc.length > 0)
                $view.append(displayConflictFullHTML("[Conflict resolved]", swapValues.removedSrc, conflict, "-"))
            if (swapValues.removedDest != null && swapValues.removedDest.length > 0)
                $view.append(displayConflictFullHTML("[Conflict resolved]", swapValues.removedDest, conflict, "-"));      
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
          $.each(Conflicts.constraintsList, function(index, conflict){  

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


     function updateConstraintBackground(selectedConstraint, toggle){
        
        var className = "";
        $.each(Conflicts.constraintsList, function(index, constraint){
            // class name should be unique so that ones with same severity doesn't influence others
            if (constraint.type == selectedConstraint)
                className = "cell-conflict-" + constraint.severity + constraint.id;
        });
          $(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
               if (isSpecialCell($(item)))
                    return;

                $(item).removeClass(className);
               var id = $(item).attr("id").substr(8);
               $.each(conflictsBySession[id], function(index, constraint){
                    if (constraint.type == selectedConstraint && toggle){
                         $(item).addClass(className);
                    } else if (constraint.type == selectedConstraint && !toggle){
                         $(item).removeClass(className);
                    }
               });
          });
     }


     // Refresh conflicts information display.
     // Called after an interaction occurs that affects conflicts. (swap, unschedule, schedule)
     function updateConflicts(isSidebarOn, isSlotOn){

        var conflict_count_array = {};
        $.each(Conflicts.constraintsList, function(index, conflict){
            conflict_count_array[conflict.type] = 0;
        });

        $(".slot").each(function(){
            var id = getID($(this));
            if (id !== -1) {
                if (isSlotOn)
                    displayConflicts(conflictsBySession[id], $(this).find(".display"));
                var conflicts_array = conflictsBySession[id].map(function(co) {return co.type});          
                    // for each constraint, count and add a modal dialog with descriptions
                    $.each(Conflicts.constraintsList, function(index, conflict){
                        var filtered_array = conflicts_array.filter(function(x){return x==conflict.type});
                        conflict_count_array[conflict.type] += filtered_array.length;             
                    });
            } else { // empty cells should clear the display
                if (isSlotOn)
                    $(this).find(".display").html("");
            }
        });         
        
        if (!isSidebarOn)
            return;

        var total = 0;
        $.each(Conflicts.constraintsList, function(index, conflict){
            $("#list-constraints li.constraint-entry").each(function(){
                if (conflict.type == $(this).attr("data-type")){
                  // Pairwise counted as 1
                    $(this).find(".count").html(Math.round(conflict_count_array[conflict.type]/2));
                    total += conflict_count_array[conflict.type];
                }
            });
        });
        $("#constraints-count").html(Math.round(total/2));

        $("#list-constraints li.constraint-entry").each(function(index, item){
            // console.log("update", $(item).hasClass("view-option-active"), $(item).attr("data-type"));
            if ($(item).hasClass("view-option-active"))
                updateConstraintBackground($(item).attr("data-type"), true);
            else
                updateConstraintBackground($(item).attr("data-type"), false);
        });
     }

    return {
        initialize: initialize,
        constraintsList: constraintsList,
        clearConflictDisplay: clearConflictDisplay,
        // displayConflicts: displayConflicts,
        // displayConflictPreviewHTML: displayConflictPreviewHTML,
        // displayConflictFullHTML: displayConflictFullHTML,
        // getConflictLength: getConflictLength,
        displayFullConflicts: displayFullConflicts,
        displayPreviewConflicts: displayPreviewConflicts,
        updateConflicts: updateConflicts,
        updateConstraintBackground: updateConstraintBackground
    };
}();       


