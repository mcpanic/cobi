// Unit session moves at the visual (front-end) level
// These can be combined to form more complex operations.

var Conflicts = function() {

    var constraintsList = [];
    var preferencesList = [];
    var constraintsSeverityList = ["high", "medium"];  // excluding "good"

	// Initialize the sidebar with a default view 
	function initialize(){
        updateConstraintsList();
	  	bindEvents();
	}

    // From CCOps.allConstraints, get all existing contraints existing in the data.
    // TODO: when constraint types are added as a transaction, handle them dynamically here, working with Polling.js
    function updateConstraintsList(){
        if(userData.id == '49c8fe6872457b891aaca167dbffcead'){

            var typeHash = {};
            $.each(CCOps.allConstraints, function(index, c){
                if (c.type in typeHash) 
                    return;
                typeHash[c.type] = c.type;
                var constraint = {};
                constraint.id = index;
                constraint.description = c.description;
                // constraint.color = "#913A52";
                // TODO: make it more reasonable
                if (c.importance < -5) {
                    constraint.severity = "high";
                } else if (c.importance < 0)
                    constraint.severity = "medium";
                else
                    constraint.severity = "good";
                constraint.importance = c.importance;
                constraint.type = c.type;

                if (constraint.severity != "good")
                    Conflicts.constraintsList.push(constraint);
                else
                    Conflicts.preferencesList.push(constraint);
            });
            Conflicts.constraintsList.sort(function(a,b){ return a.importance > b.importance; });
            Conflicts.preferencesList.sort(function(a,b){ return a.importance > b.importance; });
            console.log(Conflicts.constraintsList, Conflicts.preferencesList);        
        } else {
            Conflicts.constraintsList = constraints_list;
        }
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

    function getSeverityByType(type){
        var severity = "";
        $.each(Conflicts.constraintsList, function(index, item){
            if (item.type == type)
                severity = item.severity;
        });
        return severity;
    }

     // Given an array of "conflicts", display the palette and count for each constraint in the "element"
     // Can be used both for individual sessions and entire rows
     function displayConflicts(conflicts, element){
          if (typeof conflicts === "undefined")
              return;
         element.html("");
         // var conflicts_array = conflicts.map(function(co) {return co.type});
         $.each(Conflicts.constraintsSeverityList, function(index, severity){
            var filtered_array = conflicts.filter(function(x){return getSeverityByType(x.type)==severity});
            if (filtered_array.length > 0){
                var html = "";
                var i;            
                for (i=0; i<filtered_array.length; i++) {
                     html += "<span class='conflict-display'></span>";
                }
                var $palette = $(html).addClass("cell-conflict-" + severity)

                element.append(filtered_array.length).append($palette);
                var palette_title = severity + " severity conflicts";
                var palette_content = filtered_array.map(function(co) {
                     // if (co.type == constraint.type)
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
            }
         });

          // for each constraint, count and add a modal dialog with descriptions
          // $.each(Conflicts.constraintsList, function(index, constraint){
          //      var filtered_array = conflicts_array.filter(function(x){return getSeverityByType(x)==constraint.severity});
          //      if (filtered_array.length > 0) {
          //       console.log(filtered_array);
          //           var html = "";
          //           var i;
          //           for (i=0; i<filtered_array.length; i++) {
          //                html += "<span class='conflict-display'></span>";
          //           }
          //           var $palette = $(html).addClass("cell-conflict-" + constraint.severity)
          //           //.css("background-color", conflict.color);
          //           element.append(filtered_array.length).append($palette);
          //           var palette_title = "Conflicts: " + constraint.description;
          //           var palette_content = conflicts.map(function(co) {
          //                if (co.type == constraint.type)
          //                     return "<li>"+co.description+"</li>";
          //           }).join("");
          //           $palette.popover({
          //                html:true,
          //                placement: "bottom",
          //                trigger: "hover",
          //                title:function(){
          //                     return palette_title;
          //                },
          //                content:function(){
          //                     return palette_content;
          //                }
          //           });
          //           //$palette.popover();           
          //      }
          // });
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


     function displayViewModeConflictFullHTML(inputArray, conflict) {
        var $view = $("<span/>").addClass("conflict-preview-display-wrapper");        
        var filteredArray = inputArray == null? []: inputArray.filter(function(x){return x.type==conflict.type});
        // console.log(ment, inputArray, conflict, filteredArray);
        for (var i=0; i<filteredArray.length; i++) {
            $("<span/>")
                    .addClass("conflict-preview-display").html("&nbsp;")
                    .attr("data-html", "true")
                    // .attr("data-title", ment)
                    .attr("data-trigger", "manual")
                    .attr("data-content", "<strong>Conflict Type: " + conflict.description + "</strong><br>" + filteredArray[i].description)
                    // .popover({
                    //     html:true,
                    //     title: ment,
                    //     trigger: "hover",
                    //     html: "Type: " + conflict.label + "<br>" + filteredArray[i].description
                    // })
                    // .css("background-color", conflict.color)
                    .addClass("cell-conflict-" + conflict.severity)
                    .appendTo($view);
        }

        return $view;
     }

     function displayConflictFullHTML(ment, inputArray, conflict, sign) {
        var $view = $("<span/>").addClass("conflict-preview-display-wrapper"); 
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
                    // .css("background-color", conflict.color)
                    .addClass("cell-conflict-" + conflict.severity)
                    .appendTo($view);
        }

        return $view;
     }

     function getConflictLengthByType(inputArray, type) {
        var filteredArray = inputArray == null? []: inputArray.filter(function(x){return x.type==type});
        return filteredArray.length;
     }

     function getConflictLengthBySeverity(inputArray, severity) {
        var filteredArray = inputArray == null? []: inputArray.filter(function(x){return getSeverityByType(x.type)==severity});
        return filteredArray.length;
     }

     // Given a list of conflicts for the given session,
     // display the preview with details
     function displayViewModeSessionFullConflicts(id){
        var element = document.createElement("div");
        $(element).addClass("conflicts");

        // var conflicts = conflictsBySession[id];    
        var conflicts = conflictsBySession[id].filter(function(x){ return _.contains(Conflicts.constraintsSeverityList, getSeverityByType(x.type)); });            
        var conflicts_array = conflicts.map(function(co) {return co.type});
        // console.log(conflicts_array);
        var plural = isPlural(conflicts.length) ? "s" : "";
        if (conflicts.length > 0) {
            $(element).append("<div class='swap-total-full stronger-text'>" + conflicts.length 
              + " conflict" + plural 
              + ". <small>(click icons for details)</small></div>"); 
        }
        
        var isChanged = false;
        $("<div/>").addClass("conflict-preview-display-div-wrapper").appendTo($(element));
        // for each constraint, count and add a modal dialog with descriptions
        $.each(Conflicts.constraintsList, function(index, conflict){
            isChanged = true;
            $(element).find(".conflict-preview-display-div-wrapper").append(displayViewModeConflictFullHTML(conflicts, conflict));
        });
        if (!isChanged)
            $(element).find(".swap-total-full").hide();
        var $detail = $("<div/>").addClass("conflict-preview-detail").hide();
        $(element).append($detail);
        return outerHTML(element);
     }

     // Given a list of conflicts for the given session,
     // display the preview with details
     function displayViewModeSubmissionFullConflicts(session, submission){

        // - scheduled: session id, submission id
        // - unscheduled paper: session null, submission id
        // - empty paper: session id, submission null
        var element = document.createElement("div");
        $(element).addClass("conflicts");

        if (session != null && typeof session.id !== "undefined"){                    
            // scheduled papers
            if (submission != null && typeof submission.id !== "undefined"){

                // var tempConflicts = conflictsBySession[session.id];
                var tempConflicts = conflictsBySession[session.id].filter(function(x){ return _.contains(Conflicts.constraintsSeverityList, getSeverityByType(x.type)); });            
        
                var conflicts = [];
                // only find the ones that include this paper
                $.each(tempConflicts, function(index, item){
                    $.each(item.conflict, function(i, c){
                        // console.log(item, item.conflict, c);
                        // for each valid entity trace, see if it's this paper
                        if (c != null) { // c.submission is indexed order
                            if (c == submission.id) // finally a match
                                conflicts.push(item);
                        }
                    });
                });
                // console.log(conflicts);
                var conflicts_array = conflicts.map(function(co) {return co.type});

                var plural = isPlural(conflicts.length) ? "s" : "";
                if (conflicts.length > 0) {
                    $(element).append("<div class='swap-total-full stronger-text'>" + conflicts.length 
                      + " conflict" + plural 
                      + ". <small>(click icons for details)</small></div>"); 
                }
                
                var isChanged = false;
                $("<div/>").addClass("conflict-preview-display-div-wrapper").appendTo($(element));
                // for each constraint, count and add a modal dialog with descriptions
                $.each(Conflicts.constraintsList, function(index, conflict){
                    isChanged = true;
                    $(element).find(".conflict-preview-display-div-wrapper").append(displayViewModeConflictFullHTML(conflicts, conflict));
                });
                if (!isChanged)
                    $(element).find(".swap-total-full").hide();
                var $detail = $("<div/>").addClass("conflict-preview-detail").hide();
                $(element).append($detail);  
            // empty papers
            } else {
                // do nothing for now
            }
        } else { // unscheduled paper
            // do nothing for now
        }

        return outerHTML(element);
     }

     function filterSwapValue(swapValues){
        var s = swapValues;
        console.log("BEFORE", s.value, s);
        $.each(s.addedDest, function(i, c){
            if (!_.contains(Conflicts.constraintsSeverityList, getSeverityByType(c.type)))
                delete s.addedDest[i];
        });
        $.each(s.addedSrc, function(i, c){
            if (!_.contains(Conflicts.constraintsSeverityList, getSeverityByType(c.type)))
                delete s.addedSrc[i];
        });
        $.each(s.removedDest, function(i, c){
            if (!_.contains(Conflicts.constraintsSeverityList, getSeverityByType(c.type)))
                delete s.removedDest[i];
        });
        $.each(s.removedSrc, function(i, c){
            if (!_.contains(Conflicts.constraintsSeverityList, getSeverityByType(c.type)))
                delete s.removedSrc[i];
        });
        s.value = s.removedDest.length + s.removedSrc.length - s.addedDest.length - s.addedSrc.length;
        console.log("AFTER", s.value, s);
        return s;
     }

     function displayMoveModeSessionFullConflicts(s){
        if (typeof s === "undefined" || s == null)
               return;   

        var element = document.createElement("div");
        $(element).addClass("conflicts");

        var swapValues = filterSwapValue(s);

          var plural = isPlural(swapValues.value) ? "s" : "";
          if (swapValues.value > 0)
            $(element).append("<div class='swap-total-full stronger-text'>" + swapValues.value 
              + " conflict" + plural 
              + " will be resolved. <small>(click icons for details)</small></div>"); 
          else
            $(element).append("<div class='swap-total-full weaker-text'>" + (-1)*swapValues.value 
                + " conflict" + plural 
                + " will be added. <small>(click icons for details)<small></div> "); 
                
          var isChanged = false;
          $("<div/>").addClass("conflict-preview-display-div-wrapper").appendTo($(element));
          var $wrapper = $(element).find(".conflict-preview-display-div-wrapper");
          // for each constraint, count and add a modal dialog with descriptions
          $.each(Conflicts.constraintsList, function(index, conflict){  
            // var netCount = getConflictLength(swapValues.addedSrc, conflict) + getConflictLength(swapValues.addedDest, conflict) 
            //             - getConflictLength(swapValues.removedSrc, conflict) - getConflictLength(swapValues.removedDest, conflict);
            // if (netCount == 0)
            //      return;
            // console.log(conflict, swapValues);
            isChanged = true;
            
            if (swapValues.addedSrc != null && swapValues.addedSrc.length > 0)
                $wrapper.append(displayConflictFullHTML("[Conflict added]", swapValues.addedSrc, conflict, "+"));
            if (swapValues.addedDest != null && swapValues.addedDest.length > 0)
                $wrapper.append(displayConflictFullHTML("[Conflict added]", swapValues.addedDest, conflict, "+"))
            if (swapValues.removedSrc != null && swapValues.removedSrc.length > 0)
                $wrapper.append(displayConflictFullHTML("[Conflict resolved]", swapValues.removedSrc, conflict, "-"))
            if (swapValues.removedDest != null && swapValues.removedDest.length > 0)
                $wrapper.append(displayConflictFullHTML("[Conflict resolved]", swapValues.removedDest, conflict, "-"));      
            // var netCountClass = "conflict-netcount-added";
            // if (netCount < 0)
            //     netCountClass = "conflict-netcount-removed";            
          });
            if (!isChanged)
              $(element).find(".swap-total-full").hide();
          var $detail = $("<div/>").addClass("conflict-preview-detail").hide();
          $(element).append($detail);

        return outerHTML(element);
     }

     function displayMoveModeSubmissionFullConflicts(s){
        if (typeof s === "undefined" || s == null)
           return;      

        var element = document.createElement("div");
        $(element).addClass("conflicts");

        var swapValues = filterSwapValue(s);
          var plural = isPlural(swapValues.value) ? "s" : "";
          if (swapValues.value > 0)
            $(element).append("<div class='swap-total-full stronger-text'>" + swapValues.value 
              + " conflict" + plural 
              + " will be resolved. <small>(click icons for details)</small></div>"); 
          else
            $(element).append("<div class='swap-total-full weaker-text'>" + (-1)*swapValues.value 
                + " conflict" + plural 
                + " will be added. <small>(click icons for details)<small></div> "); 
                
          var isChanged = false;
          $("<div/>").addClass("conflict-preview-display-div-wrapper").appendTo($(element));
          var $wrapper = $(element).find(".conflict-preview-display-div-wrapper");
          // for each constraint, count and add a modal dialog with descriptions
          $.each(Conflicts.constraintsList, function(index, conflict){  
            // var netCount = getConflictLength(swapValues.addedSrc, conflict) + getConflictLength(swapValues.addedDest, conflict) 
            //             - getConflictLength(swapValues.removedSrc, conflict) - getConflictLength(swapValues.removedDest, conflict);
            // if (netCount == 0)
            //      return;
            // console.log(conflict, swapValues);
            isChanged = true;
            
            if (swapValues.addedSrc != null && swapValues.addedSrc.length > 0)
                $wrapper.append(displayConflictFullHTML("[Conflict added]", swapValues.addedSrc, conflict, "+"));
            if (swapValues.addedDest != null && swapValues.addedDest.length > 0)
                $wrapper.append(displayConflictFullHTML("[Conflict added]", swapValues.addedDest, conflict, "+"))
            if (swapValues.removedSrc != null && swapValues.removedSrc.length > 0)
                $wrapper.append(displayConflictFullHTML("[Conflict resolved]", swapValues.removedSrc, conflict, "-"))
            if (swapValues.removedDest != null && swapValues.removedDest.length > 0)
                $wrapper.append(displayConflictFullHTML("[Conflict resolved]", swapValues.removedDest, conflict, "-"));      
            // var netCountClass = "conflict-netcount-added";
            // if (netCount < 0)
            //     netCountClass = "conflict-netcount-removed";            
          });
            if (!isChanged)
              $(element).find(".swap-total-full").hide();
          var $detail = $("<div/>").addClass("conflict-preview-detail").hide();
          $(element).append($detail);

        return outerHTML(element);
     }

     // Given a list of added and removed conflicts with a swap candidate,
     // display the preview to help make the decision to do the swap.
     function displayMovePreviewConflicts(s, element){
          if (typeof s === "undefined")
               return;
          var swapValues = filterSwapValue(s);

           // if the current total already exists, compare and keep the winning one. 
            if (element.find(".swap-total").length > 0){
                var oldScore = parseInt(element.find(".swap-total").text());
                var newScore =  (-1)*swapValues.value;
                if (oldScore <= newScore)    // the lower the better (less conflicts)
                    return;
            }

          if (swapValues.value > 0)
            element.append("<div class='swap-total stronger-text'>" + addSign((-1)*swapValues.value) + "</div>"); 
          else
            element.append("<div class='swap-total weaker-text'>" + addSign((-1)*swapValues.value) + "</div>"); 
   
          var isChanged = false;

         $.each(Conflicts.constraintsSeverityList, function(index, severity){
            var netCount = getConflictLengthBySeverity(swapValues.addedSrc, severity) + getConflictLengthBySeverity(swapValues.addedDest, severity)
                  - getConflictLengthBySeverity(swapValues.removedSrc, severity) - getConflictLengthBySeverity(swapValues.removedDest, severity);
            if (netCount == 0) 
              return;
            isChanged = true;
            var $palette = $(displayConflictPreviewHTML(netCount)).addClass("cell-conflict-" + severity);
            var netCountClass = "conflict-netcount-added";
            if (netCount < 0)
                netCountClass = "conflict-netcount-removed";
            
            var $inner = $("<div class='conflict-type-preview'/>")
                .append($palette) 
                .append("<span class='" + netCountClass + "'>" + addSign(netCount) + "</span>");
            element.append($inner);
         });

          // // for each constraint, count and add a modal dialog with descriptions
          // $.each(Conflicts.constraintsList, function(index, conflict){  

          //   var netCount = getConflictLength(swapValues.addedSrc, conflict) + getConflictLength(swapValues.addedDest, conflict)
          //         - getConflictLength(swapValues.removedSrc, conflict) - getConflictLength(swapValues.removedDest, conflict);
          //   if (netCount == 0) 
          //     return;
          //   isChanged = true;
          //   var $palette = $(displayConflictPreviewHTML(netCount)).addClass("cell-conflict-" + conflict.severity);
          //   //.css("background-color", conflict.color);
          //   var netCountClass = "conflict-netcount-added";
          //   if (netCount < 0)
          //       netCountClass = "conflict-netcount-removed";
            
          //   var $inner = $("<div class='conflict-type-preview'/>")
          //       .append($palette) 
          //       .append("<span class='" + netCountClass + "'>" + addSign(netCount) + "</span>");
          //   element.append($inner);
                  
          // });

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

     function updatePreferenceBackground(selectedConstraint, toggle){
        var className = "cell-preference";
        // $.each(Conflicts.preferencesList, function(index, preference){
        //     // class name should be unique so that ones with same severity doesn't influence others
        //     if (preference.type == selectedConstraint)
        //         className = "cell-preference-" + constraint.severity + constraint.id;
        // });
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

        var conflict_type_count_array = {};
        var conflict_severity_count_array = {};
        var preference_type_count_array = {};
        $.each(Conflicts.constraintsList, function(index, item){
            conflict_type_count_array[item.type] = 0;
            conflict_severity_count_array[item.severity] = 0;
        });

        $.each(Conflicts.preferencesList, function(index, item){
            preference_type_count_array[item.type] = 0;
        });

        $(".slot").each(function(){
            var id = getID($(this));
            if (id !== -1) {
                if (isSlotOn)
                    displayConflicts(conflictsBySession[id], $(this).find(".display"));
                var conflicts_array = conflictsBySession[id].map(function(co) {return co.type});          
                    // for each constraint, count and add a modal dialog with descriptions
                    $.each(Conflicts.constraintsList, function(index, item){
                        var filtered_array = conflicts_array.filter(function(x){return x==item.type});
                        conflict_type_count_array[item.type] += filtered_array.length;            
                    });
                    $.each(Conflicts.preferencesList, function(index, item){
                        var filtered_array = conflicts_array.filter(function(x){return x==item.type});
                        preference_type_count_array[item.type] += filtered_array.length;            
                    });
            } else { // empty cells should clear the display
                if (isSlotOn)
                    $(this).find(".display").html("");
            }
        });         
        
        if (!isSidebarOn)
            return;

        // Constraints count update
        var total = 0;
        $.each(Conflicts.constraintsList, function(index, conflict){
            $("#list-constraints li.constraint-entry").each(function(){
                if (conflict.type == $(this).attr("data-type")){
                    $(this).find(".count").html(Math.round(conflict_type_count_array[conflict.type]));
                    total += conflict_type_count_array[conflict.type];
                    conflict_severity_count_array[conflict.severity] += conflict_type_count_array[conflict.type];
                }
            });
        });
        // now update aggregated counts
        $("#constraints-count").html(Math.round(total));
        $.each(conflict_severity_count_array, function(index, severity){
            $("." + index + "-severity .count").html(severity);
        });

        $("#list-constraints li.constraint-entry").each(function(index, item){
            console.log("update", $(item).hasClass("view-option-active"), $(item).attr("data-type"));
            if ($(item).hasClass("view-option-active"))
                updateConstraintBackground($(item).attr("data-type"), true);
            else
                updateConstraintBackground($(item).attr("data-type"), false);
        });

        // Preferences count update
        total = 0;
        $.each(Conflicts.preferencesList, function(index, item){
            $("#list-preferences li.preference-entry").each(function(){
                if (item.type == $(this).attr("data-type")){
                    $(this).find(".count").html(Math.round(preference_type_count_array[item.type]));
                    total += preference_type_count_array[item.type];
                }
            });
        });
        // now update aggregated counts
        $("#preferences-count").html(Math.round(total));

        $("#list-preferences li.preference-entry").each(function(index, item){
            console.log("update", $(item).hasClass("view-option-active"), $(item).attr("data-type"));
            if ($(item).hasClass("view-option-active"))
                updatePreferenceBackground($(item).attr("data-type"), true);
            else
                updatePreferenceBackground($(item).attr("data-type"), false);
        });        
     }

    return {
        initialize: initialize,
        constraintsList: constraintsList,
        preferencesList: preferencesList,
        constraintsSeverityList: constraintsSeverityList,
        clearConflictDisplay: clearConflictDisplay,
        // displayConflicts: displayConflicts,
        // displayConflictPreviewHTML: displayConflictPreviewHTML,
        // displayConflictFullHTML: displayConflictFullHTML,
        // getConflictLength: getConflictLength,
        displayViewModeSessionFullConflicts: displayViewModeSessionFullConflicts,
        displayViewModeSubmissionFullConflicts: displayViewModeSubmissionFullConflicts,
        displayMoveModeSessionFullConflicts: displayMoveModeSessionFullConflicts,
        displayMoveModeSubmissionFullConflicts: displayMoveModeSubmissionFullConflicts,
        // displayFullConflicts: displayFullConflicts,
        displayMovePreviewConflicts: displayMovePreviewConflicts,
        // displayPaperMovePreviewConflicts: displayPaperMovePreviewConflicts,
        updateConflicts: updateConflicts,
        updateConstraintBackground: updateConstraintBackground,
        updatePreferenceBackground: updatePreferenceBackground
    };
}();       


