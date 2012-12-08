

     // Temp function to remove buttons from the detail html.
     // TODO: replace with something more reasonable and scalable.
     function trimButtons(html){
          var result = $(html).find("button").hide();
          console.log(result);
          return $(html).find("button").hide().html();
     }

     function getAuthorDisplay(authors){
          var html = "";         
          $.each(authors, function(i, author){
               html += author.firstName + " " + author.lastName + ", ";
          }); 
          return html;
     }

     // Getting html for session details with individual paper info
     function getSessionDetail(type, session){
     	var html = ""; 
          if (type == "scheduled") {
               html += "<button class='btn btn-info button-propose-swap'>Propose Swaps</button>"
                    + "  <button class='btn btn-danger button-unschedule'>Unschedule</button> ";
          } else if (type == "unscheduled") {
               html += "<button class='btn btn-info button-propose-unscheduled'>Propose Slots</button>";
          } else if (type == "empty") {
               html += "<button class='btn btn-info button-propose-empty'>Propose Slots</button>";
          }

          if (typeof session !== "undefined" && typeof session.submissions !== "undefined") {
               html += " <ul class='list-submissions'>";
               $.each(session.submissions, function(index, submission){
                    html += "<li class='submission'><strong>" + submission.type + "</strong>: " 
                         + getAuthorDisplay(submission.authors) + "<br>"
                         + "<strong>" + submission.title + "</strong></li>";

               });
               html += "</ul>";
          }
     	return html;
     }

     function swapNodes(a, b) {
         var aparent= a.parentNode;
         var asibling= a.nextSibling===b? a : a.nextSibling;
         b.parentNode.insertBefore(a, b);
         aparent.insertBefore(b, asibling);
     }

     function swapSessionCell(id1, id2){
          swapNodes($("#program #session-" + id1)[0], $("#program #session-" + id2)[0]);
          $("#program #session-" + id1).css("background-color", "white").effect("highlight", {color: "yellow"}, 10000);
          $("#program #session-" + id2).css("background-color", "white").effect("highlight", {color: "yellow"}, 10000);

          /*
     	var $org1 = $("#program #session-" + id1);
     	var $org2 = $("#program #session-" + id2);
     	var $session1 = $("#program #session-" + id1).clone();
     	var $session2 = $("#program #session-" + id2).clone();
     	
     	console.log($session1, $session2);
     	$session1.css("background-color", "white").effect("highlight", {color: "yellow"}, 10000);
     	$session2.css("background-color", "white").effect("highlight", {color: "yellow"}, 10000);
     	$org1.replaceWith($session2);
     	$org2.replaceWith($session1);
          */
     }

     // For each session item, display the session information
     function getSessionCell(type, session){
			 var cell = document.createElement('td');
			 $(cell).addClass("cell slot")
                    .append("<div class='title'/><div class='display'/>");
			 
                // console.log("session", typeof session);

                // Empty Session
			 if (type == "empty" || session == -1){
                    console.log("empty");
                    var detail = document.createElement("div");
                    $(detail).hide()
                         .addClass("detail")
                         .html(getSessionDetail(type, session));
                    // TODO: how to easily get day, time, room info
                    $(cell)
                         //.attr("id", "session-" + session.id)
                         //.data("session-id", session.id)
                         .addClass("empty")
                         .append($(detail))
                         .html("<i class='icon-plus'></i>");

               // Unavailable / Locked Session                         
                } else if (type == "unavailable" || session == "") {
                    console.log("unavailable");
                    $(cell).addClass("unavailable");
               
               // Scheduled / Unscheduled Session
                } else {
                    var detail = document.createElement("div");
                    $(detail).hide()
                         .addClass("detail")
                         .html(getSessionDetail(type, session));
			 	
                    $(cell).attr("id", "session-" + session.id)
                         .data("session-id", session.id)
                         .append($(detail));
                    
                    if (typeof session.title !== "undefined")
                         $(cell).find(".title").html(session.title);
                    
                    // default view: conflicts
                    displayConflicts(conflictsBySession[session.id], $(cell).find(".display"));
                    //$(cell).find(".display").html(session.type);
			 } 
			 return cell;
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

     // Refresh conflicts information display.
     // Called after an interaction occurs that affects conflicts. (swap, unschedule, schedule)
     function updateConflicts(){
          // Lazy operation: only run when the view mode is conflicts
          if (getActiveOptions("view-options").indexOf("conflicts") === -1)
               return;
          $(".slot").each(function(){
               var id = getID($(this));
               if (id !== -1)
                    displayConflicts(conflictsBySession[id], $(this).find(".display"));
          });
          
     }

     function getPreviewSwap(swap){
          //var $session = $(".selected").first();
          //var id = getID($session);
          //var session = allSessions[id];
          //console.log(session.title);      

          //var swapValues = proposeSwap(allSessions[id]);
          var html = "";
          html += "<h4>Overall, " + swap.value
               + " conflicts will be resolved.</h4>" 
               + "<h5>" + swap.addedSrc.length + " conflicts added to source session</h5>"
               + swap.addedSrc.map(function(co) {return "<li>" + co.description + "</li>";})
               + "<h5>" + swap.removedSrc.length + " conflicts removed from source session</h5>"
               + swap.removedSrc.map(function(co) {return "<li>" + co.description + "</li>";})
               + "<h5>" + swap.addedDest.length + " conflicts added to this session</h5>"
               + swap.addedDest.map(function(co) {return "<li>" + co.description + "</li>";})
               + "<h5>" + swap.removedDest.length + " conflicts removed from this session </h5>"
               + swap.removedDest.map(function(co) {return "<li>" + co.description + "</li>";});
               console.log(html);
          return html;
     }
/*
     $("#alert").on("click", ".swap-preview-link", function(){
          return false;
     });
*/
     $("#alert").on("click", ".swap-review-link", function(){
          var id = $(this).parent().data("session-id");
          $(this).toggleClass("view-option-active");
          $("#program #session-" + id).toggleClass("highlight").popover("toggle");
          return false;
     });

     $("#list-history").on("click", ".history-link", function(){
          var id = $(this).data("session-id");
          $(this).toggleClass("view-option-active");
          $("#session-" + id).toggleClass("highlight").popover("toggle");
          return false;
     });

     // Handle a propose (swap, unschedule, schedule) request
     function proposeHandler(event){
          var $session = $(".selected").first();
//          console.log($session);
          var id = getID($session);  
          
          var swapValues; 
          if (event.data.type == "swap")
               swapValues = proposeSwap(allSessions[id]);
          else if (event.data.type == "unscheduled") {
               swapValues = proposeSlot(allSessions[id]);
          }
          else if (event.data.type == "empty") {
               console.log($session, $session.data(), $session.data("date"), event.data.type, event.target);
               console.log($session.data("date"), $session.data("time"), $session.data("room"), schedule[$session.data("date")][$session.data("time")][$session.data("room")]);
               proposeUnscheduledSessionForSlot($session.data("date"), $session.data("time"), $session.data("room"));
          } else {
               return;
          }

          swapValues.sort(function(a, b) {return b.value - a.value;});
          console.log(JSON.stringify(swapValues));

          var count = Math.min(swapValues.length, 5);
          console.log("count", count);
          var swapContent = "";
          for(var i = 0; i < count; i++){    
               if (event.data.type == "swap"){
                    $("#program #session-" + swapValues[i].target.session).addClass("proposed-swap");
                    swapContent += "<li data-session-id='" + swapValues[i].target.session + "' data-rank-order='" + i + "'>" //+ swapValues[i] 
                    + "<a href='#' class='swap-preview-link'>[preview]</a> "
                    + "resolving " + swapValues[i].value  
                    + ": <a href='#' class='swap-review-link'>" + allSessions[swapValues[i].target.session].title + "</a>" 
                    + "</li>";
               } else if (event.data.type == "unscheduled"){
                    //$("#program #session-" + swapValues[i].target.session).addClass("proposed-swap");
                    swapContent += "<li data-session-id='" + swapValues[i].target.session + "' data-rank-order='" + i + "'>" //+ swapValues[i] 
                    + "<a href='#' class='swap-preview-link'>[preview]</a> "
                    + "resolving " + swapValues[i].value  
                    + ": <a href='#' class='swap-review-link'>" 
                    + allSessions[swapValues[i].target.session].date 
                    + allSessions[swapValues[i].target.session].time 
                    + allSessions[swapValues[i].target.session].room 
                    + "</a>" 
                    + "</li>";                    
               }
               
          }

          /*
          var html = '<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'
            + '<div class="modal-header">'
            + '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">Ã—</button>'
            + '  <h3 id="myModalLabel">' + "Swap suggestions for session " + id + ": " + session.title + '</h3>'
            + '</div>'
            + '<div class="modal-body">'
            + '  <p>' + swapContent + '</p>'
            + '<p>Review highlighted swap suggestions and select one, or click Cancel to go back.</p>'
            + '</div>'
            + '<div class="modal-footer">'
            + '  <button class="btn btn-primary" id="swap-review-button">Review</button>'
            + '  <button class="btn" data-dismiss="modal" aria-hidden="true" id="swap-cancel-button">Cancel</button>'          
            + '</div>'
          + '</div>';
          $session.append(html);
          $("#myModal").modal();
          */


          $session.addClass("swap-selected");
          $session.popover("hide");
          $("#program .proposed-swap").popover("destroy");
          $("#program .proposed-swap").popover({
               html:true,
               placement: "bottom",
               trigger: "click",
               title:function(){
                    return allSessions[$(this).data("session-id")].title;
               },
               content:function(){
                    var id = $(this).data("session-id");
                    return "<button class='btn btn-primary' id='swap-button' data-session-id='" + id +"'>Swap with this session</button><br>"
                    + $(this).find(".detail ul")[0].outerHTML;
               }
          });

          //$(this).popover();
          $("#alert").html("<div class='alert'>"
          //+ "<button type='button' class='close' data-dismiss='alert'>×</button>"
          + "<strong>Swap in progress</strong>. Click one of the proposed sessions in <span class='palette'>&nbsp;</span> to switch sessions, " 
          + "or <button class='btn' type='button' id='swap-review-cancel-link'>cancel swap</button>."
          + "<div class='row'>"
          + "<div class='span3 src-display' data-session-id='" + id 
          + "'>selected session:<br> <a href='#' class='swap-review-link'>" + allSessions[id].title + "</a></div>"
          + "<div class='span6'>" + swapContent + "</div>"
          + "</div></div>");
          $("#alert .palette").css("background-color", "#FF8C00");

          // Now attach popovers for preview

          $("#alert .swap-preview-link").popover({
               html:true,
               placement: "bottom",
               trigger: "click",
               title:function(){
                    return "Preview swap results";
               },
               content:function(){
                    var id = $(this).parent().data("session-id");
                    var rank = $(this).parent().data("rank-order");
                    return getPreviewSwap(swapValues[rank]);
               }
          });
     }

     $("body").on("click", ".popover .button-propose-swap", {type: "swap"}, proposeHandler);
     $("body").on("click", ".popover .button-propose-unscheduled", {type: "unscheduled"}, proposeHandler);
     $("body").on("click", ".popover .button-propose-empty", {type: "empty"}, proposeHandler);

     // clicking the 'swap' button from one of the proposed swaps.
     // should perform swap and return to the clean state with no selection and proposals.
     $("body").on("click", ".popover #swap-button", function(){
     	     	
     	var $source = $(".swap-selected").first();
          var src_id = getID($source);
     	var dst_id = $(this).data("session-id");
     	$(".proposed-swap").popover("destroy");
          $(".proposed-swap").popover({
              html:true,
              placement: "bottom",
              trigger: "manual",
               title:function(){
                    return allSessions[$(this).data("session-id")].title;
               },
               content:function(){
                    return $(this).find(".detail").html();
               }
          });

     	//$(".selected").hide();
     	$(".selected").removeClass("selected");
          $(".swap-selected").removeClass("swap-selected");
     	$(".proposed-swap").removeClass("proposed-swap");   
          $(".highlight").removeClass("highlight");  
          displayAlert("Swap successful");

          $("#list-history").prepend("<li>swapped: " 
               + "<a href='#' class='history-link' data-session-id='" + src_id + "'>" + allSessions[src_id].title + 
               "</a> and <a href='#' class='history-link' data-session-id='" + dst_id + "'>" + allSessions[dst_id].title + "</a></li>");
          // the frontend swap
          swapSessionCell(src_id, dst_id);

          // the backend swap
          swapSessions(allSessions[src_id], allSessions[dst_id]);

          // the backend conflicts update
          getAllConflicts();
          // the frontend conflicts update: the row view of conflicts.
          updateConflicts();
     });	

     // clicking the 'cancel swap' link while swap in progress.
     // should return to the clean state with no selection and proposals.
     $("#alert").on("click", "#swap-review-cancel-link", function(){
          $(".selected").removeClass("selected");
          $(".swap-selected").removeClass("swap-selected");
          $(".proposed-swap").removeClass("proposed-swap");  
          $(".highlight").removeClass("highlight");   
          $("#alert").html("");      
     });
/*
     // clicking the cancel button from the review modal dialog
     $("#program").on("click", "#swap-cancel-button", function(){
     	$("#program .proposed-swap").removeClass("proposed-swap");
     });

     // clicking the review button from the review modal dialog
     // show highlight proposed swaps, display alert, and add popover.
     $("#program").on("click", "#swap-review-button", function(){          
     	$("#myModal").modal("hide");
     	var $session = $(".selected").first();
          $session.addClass("swap-selected");
     	//$session.css("background-color", "yellow");
     	var id = $session.attr("id").substr(8);
		var session = allSessions[id];
     	$session.popover("hide");
     	$("#program .proposed-swap").popover({
     		html:true,
            placement: "bottom",
            trigger: "click",
     		title:function(){
     			return session.title;
     		},
     		content:function(){
     			return "<button class='btn btn-primary' id='swap-button' data-session-id='" + session.id +"'>Swap with this session</button>";
     		}
     	});
     	//$(this).popover();
          $("#alert").html("<div class='alert'>"
          //+ "<button type='button' class='close' data-dismiss='alert'>×</button>"
          + "<strong>Swap in progress</strong>. Click one of the proposed sessions in <span class='palette'>&nbsp;</span> to switch sessions, " 
          + "or <a href='#' id='swap-review-cancel-link'>cancel swap</a>."
          + "</div>");
          $("#alert .palette").css("background-color", "#FF8C00");
     });
*/


     // When the unschedule button is clicked. Move the item to the unscheduled workspace.
     $("body").on("click", ".popover .button-unschedule", function(){
     	var $session = $(".selected").first();
     	var id = getID($session);

          var new_session = getSessionCell("unscheduled", allSessions[id]);
          $("#unscheduled").append(new_session);
     	$session.removeClass("selected").popover("destroy").removeAttr("id").removeData();
          var after = getSessionCell("empty");
          // Watch out! jQuery replaceWith returns the original element, not the replaced element.
          $session.replaceWith(after); 
          $(after).popover({
              html:true,
              placement: "bottom",
              trigger: "click",
               title:function(){
                    return "Empty slot";
               },
               content:function(){
                    return getSessionDetail("empty", -1);
               }
          });
          // For now, simply assign date, time, and room info to an empty session
          // TODO: maybe hook up to an empty session so that data() isn't necessary?
          $(after).data("date", allSessions[id].date).data("time", allSessions[id].time).data("room", allSessions[id].room);
          console.log($(after), $(after).data("date"), $(after).data("time"), $(after).data("room"));
          // Unschedule session in the database
          unscheduleSession(allSessions[id]);

          $(".selected").removeClass("selected");
          displayAlert("Unschedule successful");
          $("#list-history").prepend("<li>unschedule: " 
               + "<a href='#' class='history-link' data-session-id='" + id + "'>" + allSessions[id].title + "</a></li>");

          $(new_session).popover({
              html:true,
              placement: "bottom",
              trigger: "click",
               title:function(){
                    return allSessions[id].title;
               },
               content:function(){
                    return getSessionDetail("unscheduled", allSessions[id]);
               }
          });
          //$cloned_session.removeClass("selected");
          updateUnscheduledCount();
          // the backend conflicts update
          getAllConflicts();
          // the frontend conflicts update: the row view of conflicts.
          updateConflicts();          

     });

     function updateUnscheduledCount(){
          var count = $("#unscheduled .slot").length;
          $("#unscheduled-count").html(count);
     }

     // Event handler for clicking an individual session
     $("#unscheduled").on("click", ".slot", function(){
     	// detect if the currently selected item is selected again.
     	var $selection = $("#unscheduled .selected");
     	var isSelected = $selection[0] == $(this)[0];
     	$selection.removeClass("selected"); //.popover("hide");

     	// if reselected, do nothing.
     	if (isSelected)
     		return;
     	var id = getID($(this));
     	$(this).addClass("selected");
/*
     	$(this).popover({
     		html:true,
               placement: "bottom",
               trigger: "click",
     		title:function(){
                    return allSessions[$(this).attr("id").substr(8)].title;
     		},
     		content:function(){
     			return $(this).find(".detail").html();
     		}
     	});

     	$(this).popover("toggle");
*/     });

     // Event handler for clicking an individual session
     $("#program").on("click", ".slot", function(){
     	// detect if the currently selected item is selected again.
     	var $selection = $("#program .selected");
     	var isSelected = $selection[0] == $(this)[0];
     	$selection.removeClass("selected").popover("hide");

     	// if reselected, do nothing.
     	if (isSelected)
     		return;
          // do nothing for unavailable slots
          if ($(this).hasClass("unavailable"))
               return;
          // if empty, show available schedule options.
          if ($(this).hasClass("empty")){
               //TODO: show available options
               $(this).addClass("selected");
               return;
          }
               

     	var id = getID($(this));
		var session = allSessions[id];
     	$(this).addClass("selected");
     	$(this).popover({
     	    html:true,
              placement: "bottom",
              trigger: "manual",
     		title:function(){
     			return session.title;
     		},
     		content:function(){
     			return $(this).find(".detail").html();
     		}
     	});
     	$(this).popover("show");
     });

     function displayProgram(schedule){
          var orderedRooms = keys(allRooms).sort(function(a,b) { return allRooms[a] - allRooms[b];});
          // Table Header
          var table = document.createElement('table'); 
          var header = document.createElement('tr');
          var firstcell = $(document.createElement('td')).addClass("cell").append("<div>Time</div>");
          //var secondcell = $(document.createElement('td')).addClass("cell").append("<div>Conflicts</div>");
          $(header).addClass("header-row").append(firstcell); //.append(secondcell);
          for(var i = 0; i < orderedRooms.length; i++){
               var cell = document.createElement('td');
               $(cell).addClass("cell").append("<div>" + orderedRooms[i] + "</div>");
               $(header).append(cell);
          }
          $("#program").append(header);

          // Main content
          for(var i = 0; i < schedule.length; i++){
               var row = document.createElement('tr');
               var slot = document.createElement('td');
//             var conflicts = document.createElement('td');
               $(slot).addClass("cell").append(shortenDate(schedule[i][0]) + " " + schedule[i][1]); // schedule[i][0]: full date. schedule[i][1]: time
               $(row).append(slot);

               /* Displaying conflicts 
               var conflicts = document.createElement('td');
               $(conflicts).addClass("cell conflicts");
               displayConflicts(conflictsByTime[schedule[i][0]][schedule[i][1]], $(conflicts));               
               $(row).append(conflicts);
               */

               for(var j = 2; j < schedule[i].length; j++){
                    var cell = getSessionCell("scheduled", schedule[i][j]);
                    $(row).append(cell);
               }
               $('#program').append(row);
          }
          updateUnscheduledCount();
     }

     var scheduleMatrix = [];

     $(document).ready(function() {
	    initialize();
	    // test: swapping leveraging the crowd with madness
	    // swapSchedule(schedule["May 7, 2012"]["11:30"]["Ballroom F"]["117"],
	    //				  schedule["May 10, 2012"]["08:30"]["Ballroom D"]["223"]);
	    //		     alert(JSON.stringify(schedule["May 7, 2012"]["11:30"]["Ballroom F"]));
	    //		     alert(JSON.stringify(schedule["May 10, 2012"]["08:30"]["Ballroom D"]));
	     
	     // test: checking that personas got attached to sessions and print out full persona names
	    // for(var s in schedule["May 7, 2012"]["11:30"]["Ballroom F"]){
	    //  	 console.log(JSON.stringify(keys(allSessions[s]["personas"]).map(function(x) {return personaHash[x]})));
	    // }

	     // test: find all sesions with conflicts
	     	  //    for(var s1 in allSessions){
	     		 // for(var s2 in allSessions){
	     		 //     if(authorConflictsAmongSessions[s1][s2].length > 0){
	     			//  	console.log(JSON.stringify(authorConflictsAmongSessions[s1][s2]));
	     			//  return;
	     		 //     }
	     		 // }
	     	  //    }
	     // test: checking author conflict finding
	     //	alert(JSON.stringify(computeAuthorConflicts(allSessions["117"], allSessions["47"])));
	     //	     	alert(JSON.stringify(computePersonaConflicts(allSessions["117"], allSessions["47"])));
	     
	     

	     // test: how many conflicts are caused by a session
	     //alert(calculateNumConflictsCausedBy(allSessions["39"]));
	     
	     // test: Proposing a swap
	     	  //    alert(JSON.stringify(proposeSwap(allSessions["39"])));
	     	  //    var swapValues = proposeSwap(allSessions["39"]);
	     	  //    var sortedSwaps = keys(swapValues).sort(function(a, b) {return swapValues[b]- swapValues[a];});
	     	  //    // return top 10 swaps
	     	  //    var output = "Finding good swaps for session 39 (" + allSessions["39"].title + ")\n";
	     	  //    for(var i = 0; i < 10; i++){
	     		 // output += sortedSwaps[i] + " (" + allSessions[sortedSwaps[i]].title + "): " + swapValues[sortedSwaps[i]] + "\n";
	     	  //    }
	     	  //    alert(output);
	     
	     
	     scheduleMatrix = makeProgram();
	     displayProgram(scheduleMatrix);

          displayUnscheduled();
     	displayConstraints();
     	displayViewOptions();
     	displayPersonas();          
	 });


