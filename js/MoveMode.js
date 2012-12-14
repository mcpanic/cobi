var MoveMode = function() {
    var isOn = false;

    // Initialize the view mode 

    function initialize(type){
        isOn = true;
        ViewMode.destroy();
        bindEvents();
        runPropose(type);
    }

    // Add event handlers to each sidebar item
    function bindEvents(){

    }


     // for each conflict preview tpe (addedSrc, removedSrc, addedDest, removedDest),
     // display appropriate message
     function displayPreviewByType(type, item) {
          var html = "";
          var length = getLength(item);
          var typeMessage = "";
          if (type === "addedSrc") 
               typeMessage = " conflicts added to source session";
          else if (type === "removedSrc")
               typeMessage = " conflicts removed from source session";
          else if (type === "addedDest")
               typeMessage = " conflicts added to this session";
          else if (type === "removedDest")
               typeMessage = " conflicts removed to this session";
          
          html = "<h5>" + length + typeMessage + "</h5>"
          if (length > 0) 
               item.map(function(co) {return html + "<li>" + co.description + "</li>";})         
          else
               return html;
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
               + displayPreviewByType("addedSrc", swap.addedSrc)
               + displayPreviewByType("removedSrc", swap.removedSrc)
               + displayPreviewByType("addedDest", swap.addedDest)
               + displayPreviewByType("removedDest", swap.removedDest);
               //console.log(html);
          return html;
     }

     // For proposed swap options, display the right popover
     function renderProposedSwap(type){

          $(".proposed-swap").popover("destroy");
          $(".proposed-swap").popover({
               html:true,
               placement: "bottom",
               trigger: "click",
/*               title:function(){
                    return allSessions[$(this).data("session-id")].title;
               },
*/               content:function(){
                    var id = $(this).data("session-id");
                    if (typeof id === "undefined") {
                         console.log("renderProposedSwap: empty");
                         return "<button class='btn btn-primary' id='schedule-button'" 
                         + "data-date='"+$(this).data("date")+"' data-time='"+$(this).data("time")+"' data-room='"+$(this).data("room")
                         +"'>Schedule in this slot</button><br>";
                         
                    } else { 
                         if (type === "swap") {
                              console.log("renderProposedSwap: swap");
                              return "<button class='btn btn-primary' id='swap-button' data-session-id='" + id 
                              + "'>Swap with this session</button><br>"
                              + $(this).find(".detail ul")[0].outerHTML;
                         } else { // unscheduled session
                              console.log("renderProposedSwap: unscheduled");
                              return "<button class='btn btn-primary' id='schedule-button' data-session-id='" + id 
                              + "'>Schedule this session</button><br>"
                              + $(this).find(".detail ul")[0].outerHTML;
                         }
                    }
               }
          });
     }
 

     // Handle a propose (swap, unschedule, schedule) request
     function runPropose(type){
          var $session = $(".selected").first();
          var id = getID($session);  
          
          var swapValues; 
          if (type === "swap")
               swapValues = proposeSwap(allSessions[id]);
          else if (type === "unscheduled") {

           console.log("unscheduled", id);
               swapValues = proposeSlot(allSessions[id]);
          }
          else if (type === "empty") {
               console.log($session, $session.data(), $session.data("date"), type);
               console.log($session.data("date"), $session.data("time"), $session.data("room"), schedule[$session.data("date")][$session.data("time")][$session.data("room")]);
               swapValues = proposeUnscheduledSessionForSlot($session.data("date"), $session.data("time"), $session.data("room"));
    
          } else {
               return;
          }

          // Now display each candidate 
          swapValues.sort(function(a, b) {
              // HQ: slight edits here to handle locked slots
              if(a.target.date != null && scheduleSlots[a.target.date][a.target.time][a.target.room]['locked']){
                  return 1;
              } else {
                return b.value - a.value;
              }
            });

          //console.log(JSON.stringify(swapValues));
          //var count = Math.min(swapValues.length, 5);
          var swapContent = "";
          for(var i = 0; i < swapValues.length; i++){    
               // empty candidate
               if (swapValues[i].target.session === null){
                    var $cell = getCellByDateTimeRoom(swapValues[i].target.date, swapValues[i].target.time, swapValues[i].target.room);
                    $cell.addClass("proposed-swap").data("title", "Empty slot");

                    if (i<5)    // display recommended
                        $cell.addClass("recommended");

                    swapContent += "<li data-rank-order='" + i + "' data-date='"+swapValues[i].target.date+"' data-time='"+swapValues[i].target.time+"' data-room='"+swapValues[i].target.room+"'>" 
                    + "<a href='#' class='swap-preview-link'>[preview]</a> "
                    + "adding " + (-1*swapValues[i].value)  
                    + ": <a href='#' class='swap-review-link'>" + displaySlotTitle(swapValues[i].target) + "</a>" 
                    + "</li>";                    

               // non-empty candidate
               } else {
                    var $cell = $("#session-" + swapValues[i].target.session);
                    $cell.addClass("proposed-swap").data("title", allSessions[swapValues[i].target.session].title);
                    
                    if (i<5)    // display recommended
                        $cell.addClass("recommended");

                    swapContent += "<li data-session-id='" + swapValues[i].target.session + "' data-rank-order='" + i + "'>" //+ swapValues[i] 
                    + "<a href='#' class='swap-preview-link'>[preview]</a> "
                    + "resolving " + swapValues[i].value  
                    + ": <a href='#' class='swap-review-link'>" + displaySlotTitle(swapValues[i].target) + "</a>" 
                    + "</li>";
               }
          }

          // For proposed slots, add a new popover
          $session.addClass("swap-selected");
          $session.popover("hide");

          renderProposedSwap(type);


          // Display at the top alert box the full information about this proposal
          var alert_html = "";
          alert_html = "<strong>Schedule change in progress</strong>. Click any session to schedule. Recommended sessions in <span class='palette'>&nbsp;</span> minimize conflicts. " 
          + " <button class='btn btn-mini' type='button' id='swap-review-cancel-link'>cancel move</button>.";
//          + "<div class='row'>";
/*
          if (id === -1)
               alert_html += "<div class='span3 src-display' data-date='"+$session.data("date")+"' data-time='"+$session.data("time")+"' data-room='"+$session.data("room")+"'>" 
          else
               alert_html += "<div class='span3 src-display' data-session-id='" + id + "'>";
*/
          //alert_html += "selected session:<br> <a href='#' class='swap-review-link'>" + displaySessionTitle($session) + "</a></div>"
          //          + "<div class='span6'>" + swapContent + "</div>"
          //          + "</div></div>";
        
          Statusbar.display(alert_html);
          $("#statusbar .palette").css("background-color", "#fd8d3c");
/*
          // Now attach popovers for preview
          $("#statusbar .swap-preview-link").popover({
               html:true,
               placement: "bottom",
               trigger: "click",
               title:function(){
                    return "Preview swap results";
               },
               content:function(){
                    var rank = $(this).parent().data("rank-order");
                    return getPreviewSwap(swapValues[rank]);
               }
          });
*/
     }



/*
     $("#alert").on("click", ".swap-preview-link", function(){
          return false;
     });
*/

/*
     $("#alert").on("click", ".swap-review-link", function(){
          var id = $(this).parent().data("session-id");
          $(this).toggleClass("view-option-active");
          console.log(id, $(this).parent().data("date"));     
          var cell = null;
          if (typeof id === "undefined")
               cell = getCellByDateTimeRoom($(this).parent().data("date"), $(this).parent().data("time"), $(this).parent().data("room"));
          else
               cell = $("#session-" + id)

          $(cell).toggleClass("highlight").popover("toggle");
          return false;
     });
*/

    function postMove(){
        updateUnscheduledCount();
        // the backend conflicts update
        getAllConflicts();
        // the frontend conflicts update: the row view of conflicts.
        updateConflicts();

        ViewMode.initialize();
    }

     // clicking the 'swap' button from one of the proposed swaps.
     // should perform swap and return to the clean state with no selection and proposals.
     $("body").on("click", ".popover #swap-button", function(){               
        var $source = $(".swap-selected").first();
        var src_id = getID($source);
        var dst_id = $(this).data("session-id");

        $("#list-history").prepend("<li>swapped: " 
               + "<a href='#' class='history-link' data-session-id='" + src_id + "'>" + allSessions[src_id].title 
               + "</a> and <a href='#' class='history-link' data-session-id='" + dst_id + "'>" + allSessions[dst_id].title + "</a></li>");
        // the frontend swap
        swapSessionCell(src_id, dst_id);
        // the backend swap
        swapSessions(allSessions[src_id], allSessions[dst_id]);

        postMove();
        Statusbar.display("Swap successful");
     });    


    // clicking the 'schedule' button from one of the proposed swaps. - for empty or unscheduled sessions
    // should perform scheduling and return to the clean state with no selection and proposals.
    $("body").on("click", ".popover #schedule-button", function(){
        var $session = null;     // session to schedule
        var $emptySlot = null;   // empty slot into shich the session is going
        var id = -1;

        // empty slot is the target, unscheduled session is the source
        //console.log(typeof $(this).data("session-id"), $(this).data("date"), $(this).data("time"), $(this).data("room"));
        if (typeof $(this).data("session-id") === "undefined") {   
           $session = $(".swap-selected").first();
           $emptySlot = getCellByDateTimeRoom($(this).data("date"), $(this).data("time"), $(this).data("room"));
        // unscheduled session is the target, empty slot is the source
        } else { 
           var session_id = $(this).data("session-id");
           $session = $("#session-" + session_id);
           $emptySlot = $(".swap-selected").first();
        }

        id = getID($session);
        //console.log($session, $emptySlot, id);

        $("#list-history").prepend("<li>scheduled: " 
           + "<a href='#' class='history-link' data-session-id='" + id + "'>" + allSessions[id].title 
           + "</a></li>");

        // the backend scheduling
        console.log("SCHEDULE", id, "into", $emptySlot.data("date"), $emptySlot.data("time"), $emptySlot.data("room"));
        scheduleSession(allSessions[id], $emptySlot.data("date"), $emptySlot.data("time"), $emptySlot.data("room"));

        // the frontend scheduling: backend should be called first to have the updated allSessions[id] information
        scheduleSessionCell(id, $emptySlot, $session);

        postMove();
        Statusbar.display("Scheduling successful");
    });  


    // clicking the 'cancel swap' link while swap in progress.
    // should return to the clean state with no selection and proposals.
    // return to original popovers
    $("#statusbar").on("click", "#swap-review-cancel-link", function(){
        Statusbar.display("Select a session for scheduling options and more information.");    
        ViewMode.initialize();
    });

    // Reset any change created in this view mode
    function destroy(){
        isOn = false;
        // TOOD: check all the other things the swapping mode has created and reset/undo them.
        
        $(".recommended").removeClass("recommended");
        $(".selected").popover("destroy").removeClass("selected");
        $(".swap-selected").popover("destroy").removeClass("swap-selected");
        $(".proposed-swap").popover("destroy").removeClass("proposed-swap");   
        $(".highlight").removeClass("highlight");          
        //$("#statusbar .swap-preview-link").popover("destroy");
    }

    return {
        isOn: isOn,
        initialize: initialize,
        destroy: destroy
    };
}();     