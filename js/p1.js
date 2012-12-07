
	function getRandomColor(){
		return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
	}

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
     function getSessionDetail(submissions){
          if (typeof submissions == "undefined") {
               return;
          }
     	var html = "<button class='btn btn-info button-propose-swap'>Propose Swaps</button>"
     		+ "  <button class='btn btn-danger button-unschedule'>Unschedule</button> "
     		+ " <ul class='list-submissions'>";
     	$.each(submissions, function(index, submission){
     		html += "<li class='submission'><strong>" + submission.type + "</strong>: " 
                    + getAuthorDisplay(submission.authors) + "<br>"
                    + "<strong>" + submission.title + "</strong></li>";

     	});
     	html += "</ul>";
     	return html;
     }

     function getSessionNumSubmissions(submissions){
     	var key, count = 0;
     	for (key in submissions){
     		count++;
     	}
     	return count;
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

     function getSessionCell(session){
			 var cell = document.createElement('td');
			 $(cell).addClass("cell slot")
                    .append("<div class='title'/><div class='display'/>");
			 
                // console.log("session", typeof session);

			 if (session == -1){
                    console.log("-1");
                    $(cell).addClass("empty").html("<a href='#'><i class='icon-plus'></i></a>");
                } else if (session == "") {
                    console.log("unavailable");
                    $(cell).addClass("unavailable");
                } else {
			 	$(cell).attr("id", "session-" + session.id);
			 	$(cell).data("session-id", session.id);
			 	$(cell).data("title", session.title);
			 	$(cell).data("session-type", session.type);
			 	$(cell).data("num-papers", getSessionNumSubmissions(session.submissions));
			 	$(cell).data("awards", session.hasAward);
			 	$(cell).data("honorable-mentions", session.hasHonorableMention);
			 	$(cell).data("duration", 80);
			 	$(cell).data("persona", keys(session.personas).map(function(x) {return personaHash[x]}));
			 	// getting a random persona for now
			 	//var persona = personas_list[Math.floor(Math.random()*personas_list.length)];
			 	//$(cell).data("persona", persona.id);

			 	// default view: session type
                    if (typeof session.title !== "undefined")
                         $(cell).find(".title").html(session.title);
			    //$(cell).find(".display").html(session.type);
                   displayConflicts(conflictsBySession[session.id], $(cell).find(".display"));
			    
			    var detail = document.createElement("div");
			    $(detail).hide();	
			    $(detail).addClass("detail").html(getSessionDetail(session.submissions));
			    $(cell).append($(detail));
			 } 
			 return cell;
     }

     // Given an array of "conflicts", display the palette and count for each constraint in the "element"
     // Can be used both for individual sessions and entire rows
     function displayConflicts(conflicts, element){
          if (typeof conflicts === "undefined")
               return;
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

     // For each row, update conflicts display
     function updateConflicts(){
          $(".conflicts").each(function(index){
               $(this).html("");
               displayConflicts(conflictsByTime[scheduleMatrix[index][0]][scheduleMatrix[index][1]], $(this));
          });
          
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


     function getPreviewSwap(dst_id, swapValues){
          var $session = $(".selected").first();
          var id = $session.attr("id").substr(8);
          //var session = allSessions[id];
          //console.log(session.title);      

          //var swapValues = proposeSwap(allSessions[id]);
          var html = "";
          html += "<h4>Overall, " + swapValues[dst_id].value
               + " conflicts will be resolved.</h4>" 
               + "<h5>" + swapValues[dst_id].addedSrc.length + " conflicts added to source session</h5>"
               + swapValues[dst_id].addedSrc.map(function(co) {return "<li>" + co.description + "</li>";})
               + "<h5>" + swapValues[dst_id].removedSrc.length + " conflicts removed from source session</h5>"
               + swapValues[dst_id].removedSrc.map(function(co) {return "<li>" + co.description + "</li>";})
               + "<h5>" + swapValues[dst_id].addedDest.length + " conflicts added to this session</h5>"
               + swapValues[dst_id].addedDest.map(function(co) {return "<li>" + co.description + "</li>";})
               + "<h5>" + swapValues[dst_id].removedDest.length + " conflicts removed from this session </h5>"
               + swapValues[dst_id].removedDest.map(function(co) {return "<li>" + co.description + "</li>";});
          return html;
     }

     $("#alert").on("click", ".swap-preview-link", function(){
          return false;
     });

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

     $("body").on("click", ".popover .button-propose-swap", function(){
		var $session = $(".selected").first();
		var id = $session.attr("id").substr(8);  	

		var swapValues = proposeSwap(allSessions[id]);
 	     //console.log(JSON.stringify(swapValues));
          var sortedSwaps = keys(swapValues).sort(function(a, b) {return swapValues[b].value - swapValues[a].value ;});
          //console.log(JSON.stringify(sortedSwaps));

 	     var swapContent = "";
 	     for(var i = 0; i < 5; i++){
               
 	     	$("#program #session-" + sortedSwaps[i]).addClass("proposed-swap");
 		 	swapContent += "<li data-session-id='" + sortedSwaps[i] + "'>" //+ sortedSwaps[i] 
               + "<a href='#' class='swap-preview-link'>[preview]</a> "
               + "resolving " + swapValues[sortedSwaps[i]].value  
               + ": <a href='#' class='swap-review-link'>" + allSessions[sortedSwaps[i]].title + "</a>" 
               /*
               + swapValues[sortedSwaps[i]].addedSrc 
               + swapValues[sortedSwaps[i]].removedSrc 
               + swapValues[sortedSwaps[i]].addedDest 
               + swapValues[sortedSwaps[i]].removedDest
               */
               + "</li>";
               console.log(swapValues[sortedSwaps[i]].addedSrc, swapValues[sortedSwaps[i]].removedSrc, swapValues[sortedSwaps[i]].addedDest, swapValues[sortedSwaps[i]].removedDest)
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
                    return getPreviewSwap(id, swapValues);
               }
          });
     });

     // clicking the 'swap' button from one of the proposed swaps.
     // should perform swap and return to the clean state with no selection and proposals.
     $("body").on("click", ".popover #swap-button", function(){
     	     	
     	var $source = $(".swap-selected").first();
          var src_id = $source.attr("id").substr(8);
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
          $("#alert").html("<div class='alert alert-success'>"
          //+ "<button type='button' class='close' data-dismiss='alert'>×</button>"
          + "<strong>Swap successful</strong>."
          + "</div>");
          $("#alert .alert").delay(10000).fadeOut("slow", function () { $(this).remove(); });

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

     // Display schedule options inside a popover
     function displayScheduleOptions(id){
          if (typeof submissions == "undefined") {
               return;
          }
          var html = "<button class='btn btn-info button-propose-swap'>Propose Swaps</button>"
               + "  <button class='btn btn-danger button-unschedule'>Unschedule</button> "
               + " <ul class='list-submissions'>";
          $.each(submissions, function(index, submission){
               html += "<li class='submission'><strong>" + submission.type + "</strong>: " 
                    + getAuthorDisplay(submission.authors) + "<br>"
                    + "<strong>" + submission.title + "</strong></li>";

          });
          html += "</ul>";
          return html;

     }

     // When the unschedule button is clicked. Move the item to the unscheduled workspace.
     $("body").on("click", ".popover .button-unschedule", function(){
     	var $session = $(".selected").first();
     	var id = $session.attr("id").substr(8);

          var new_session = getSessionCell(allSessions[id]);
          $("#unscheduled").append(new_session);
     	$session.removeClass("selected").popover("hide").addClass("empty").html("").removeAttr("id").removeData();
          $session.popover("destroy");

          // Unschedule session in the database
          unscheduleSession(allSessions[id]);

          $(".selected").removeClass("selected");
          $("#alert").html("<div class='alert alert-success'>"
          //+ "<button type='button' class='close' data-dismiss='alert'>×</button>"
          + "<strong>Unschedule successful</strong>."
          + "</div>");
          $("#alert .alert").delay(10000).fadeOut("slow", function () { $(this).remove(); });

          $("#list-history").prepend("<li>unschedule: " 
               + "<a href='#' class='history-link' data-session-id='" + id + "'>" + allSessions[id].title + "</a></li>");

          $(new_session).popover({
              html:true,
              placement: "bottom",
              trigger: "click",
               title:function(){
                    return allSessions[$(this).data("session-id")].title;
               },
               content:function(){
                    return displayScheduleOptions(id);
                    //return $(this).find(".detail").html();
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
     	var id = $(this).attr("id").substr(8);
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
               return;
          }
               

     	var id = $(this).attr("id").substr(8);
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
/*
     // Event handler for mouse hovering an individual session
     $("#program").on("mouseenter", ".slot", function(){
     	// ignore if the current item is "selected"
     	console.log($(this).hasClass("selected"));
     	if ($(this).hasClass("selected") || $("#program .selected").length != 0 || $(this).hasClass("empty"))
     		return;
          // detect if the currently selected item is selected again.
          //var $selection = $("#program .selected");
          //var isSelected = $selection[0] == $(this)[0];
          //$selection.removeClass("selected").popover("hide");

          // if reselected, do nothing.
          //if (isSelected)
          //     return;
        else{
          //$(this).addClass("hovered");
          $(this).popover({
               html:true,
               placement: "bottom",
               trigger: "hover",
               title:function(){
                    return $(this).data("title");
               },
               content:function(){
                    return $(this).find(".detail").html();
               }
          });
          $(this).popover("show");
        }
     });

     // Event handler for mouse hovering an individual session
     $("#program").on("mouseleave", ".slot", function(){
     	// ignore if the current item is "selected"
     	//console.log($(this).hasClass("selected"));
     	if ($(this).hasClass("selected"))
     		return;
     	else
        	$(this).popover("hide");        
     });
*/

     // Upon selecting a constraint, highlight the ones that violate the selected constraint.
     $("#list-constraints").on("click", "li a", function(){
          var $this = $(this);
          var toggle = true;
          if ($(this).parent().hasClass("view-option-active"))
               toggle = false;
          $("#list-constraints .view-option-active").removeClass("view-option-active");
          if (toggle)
              $(this).parent().addClass("view-option-active");
          var selected_constraint = $(this).parent().data("type");
          $(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
               $(item).css("background-color", "white");
               var id = $(item).attr("id").substr(8);
               var session = allSessions[id];     
               var color = "#FFFFFF"; // default white
               if (toggle)
                    color = $this.find(".palette").css("background-color");
               //session.personas.contains(selected_persona);
               $.each(conflictsBySession[id], function(index, constraint){
                    if (constraint.type == selected_constraint){
                         $(item).css("background-color", color);
                    }
               });
          });
         return false;
     });

     // Upon selecting a view option, change the view
     $("#list-view-options").on("click", "li a", function(){
     	$("#list-view-options .view-option-active").removeClass("view-option-active");
     	$(this).parent().addClass("view-option-active");
     	switch($(this).parent().data("type")){
     		case "session-type":
     			$(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
     				var id = $(item).attr("id").substr(8);
					var session = allSessions[id];
					$(item).find(".display").html(session.type);
     			});
     		break;
               case "conflicts":
                    $(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
                         var id = $(item).attr("id").substr(8);
                         $(item).find(".display").html("");
                         displayConflicts(conflictsBySession[id], $(item).find(".display"));
                         //$(item).find(".display").html(conflictsBySession[id]);
                    });
               break;                 
               case "popularity":
                    $(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
                         var id = $(item).attr("id").substr(8);
                         $(item).find(".display").html(sessionPopularity[id]);
                    });
               break;               
     		case "num-papers":
     			$(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
     				var id = $(item).attr("id").substr(8);
					var session = allSessions[id];
     				$(item).find(".display").html(getSessionNumSubmissions(session.submissions));
     			});
     		break;
     		case "duration":
     			$(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
     				$(item).find(".display").html("80");
     			});
     		break;
     		case "awards":
     			$(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
     				var id = $(item).attr("id").substr(8);
					var session = allSessions[id];
     				if (session.hasAward)
     					$(item).find(".display").html("<img src='img/best-paper.png' class='icon'/>");
                         else
                              $(item).find(".display").html("");
     			});
     		break;
     		case "honorable-mentions":
     			$(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
     				var id = $(item).attr("id").substr(8);
					var session = allSessions[id];     				
     				if (session.hasHonorableMention)
     				    $(item).find(".display").html("<img src='img/nominee.png' class='icon'/>");
                         else
                             $(item).find(".display").html(""); 
     			});     		     		
     		break;
     		case "persona":
     			$(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
     				var id = $(item).attr("id").substr(8);
					var session = allSessions[id];
     				$(item).find(".display").html(keys(session.personas).map(function(x) {return personaHash[x]}));
     			});
     		break;
     		default:
     		break;
     	}
          return false;
     });

	$("#list-personas").on("click", "li a", function(){
		var $this = $(this);
     	var toggle = true;
          if ($(this).parent().hasClass("view-option-active"))
               toggle = false;
          $("#list-personas .view-option-active").removeClass("view-option-active");
          if (toggle)
     	    $(this).parent().addClass("view-option-active");
     	var selected_persona = $(this).parent().data("type");
		$(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
			$(item).css("background-color", "white");
			var id = $(item).attr("id").substr(8);
			var session = allSessions[id];	
			var color = "#FFFFFF"; // default white
               if (toggle)
                    color = $this.find(".palette").css("background-color");
			//session.personas.contains(selected_persona);
			$.each(keys(session.personas), function(index, key){
				if (key == selected_persona){
					$(item).css("background-color", color);
				}
			});
		});
	    return false;
	});

     function displayUnscheduled(){
          keys(unscheduled).map(function(id){
               var cell = getSessionCell(allSessions[id]);
               $("#unscheduled").append(cell); 
               $(cell).popover({
                   html:true,
                   placement: "bottom",
                   trigger: "click",
                    title:function(){
                         return allSessions[$(this).data("session-id")].title;
                    },
                    content:function(){
                         return $(this).find(".detail").html();
                    }
               });        
          });
     }

	function displayConstraints(){
     	$.each(constraints_list, function(index, constraint){
     		var item = document.createElement("li");
     		$(item).data("type", constraint.type).html("<a href='#'><span class='palette'></span>" + constraint.label + "</a>");
     		$("#list-constraints").append($(item));
     		$(item).find("span.palette").css("background-color", constraint.color);
      	});
	}

     // Populate the View options list
     function displayViewOptions(){
     	$.each(options_list, function(index, option){
     		var item = document.createElement("li");
     		$(item).data("type", option.id).html("<a href='#'>" + option.label + "</a>");
     		$("#list-view-options").append($(item));
      	});
      	$("#list-view-options li:first-child").addClass("view-option-active");
     }

     // Display the persona list
     function displayPersonas(){
          var color_index = 0;
     	$.each(personaHash, function(index, persona){
     		var item = document.createElement("li");
      		$(item).data("type", index).html("<a href='#'><span class='palette'></span>" + persona + "</a>");
     		$("#list-personas").append($(item));    		
     		$(item).find("span.palette").css("background-color", color_palette_1[color_index]);
               color_index++;
     	});
     	/*
     	$.each(personas_list, function(index, persona){
     		var item = document.createElement("li");
      		$(item).data("type", persona.id).html("<a href='#'><span class='palette'></span>" + persona.label + "</a>");
     		$("#list-personas").append($(item));    		
     		$(item).find("span.palette").css("background-color", persona.color);
     	});
		*/
     }


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
                    var cell = getSessionCell(schedule[i][j]);
                    $(row).append(cell);
               }
               $('#program').append(row);
           }
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
          updateUnscheduledCount();

	 });


