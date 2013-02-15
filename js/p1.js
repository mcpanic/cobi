
    // Popover close button interaction
    $("body").on("click", ".popover-close", function(){
        // console.log("popover-close", $(this).attr("data-session-id"));
        var $cell = null;
        if (typeof $(this).attr("data-session-id") === "undefined"){
            $cell = findCellByDateTimeRoom($(this).attr("data-date"), $(this).attr("data-time"), $(this).attr("data-room"));
        } else {
            $cell = findCellByID($(this).attr("data-session-id"));
        }
        $cell.trigger("click");
//        $cell.popover("hide");
    });

    // Read paper IDs in order from a submission list
    function _readPaperOrder($list){
        var order = [];
        $.each($list.find("li"), function(index, item){
            // not including the last empty element
            if (item.id != "")
                order.push(item.id);
        });
        return order;
    }

    // Get html for a list of submissions for a session
    function getSubmissionList(mode, session, srcType){
        var element = document.createElement("ul");
        $(element).addClass("list-submissions");
        $.each(session.submissions, function(index, submission){
            $(element).append(getSubmissionDetail(mode, "scheduled", submission, srcType, session));                    
        });
        if (mode != "move") // do not show empty submission when move
            $(element).append(getSubmissionDetail(mode, "empty", null, srcType, session));    
        return outerHTML(element); 
    }

    // get html for a session in the view mode
    function _getViewSessionDetail(type, session){
        var element = document.createElement("div");
        if (typeof session !== "undefined" && session != null && typeof session.id !== "undefined" && session.id != null) {
           //$("<span/>").attr("id", "popover-session-" + session.id).addClass("hidden").appendTo($(element));
           $(element).attr("id", session.id);
        }

        // HQ: locked sessions get only a locked button
        var isLocked = false;
        if (type != "unscheduled" && typeof session !== "undefined" && session != null){
            isLocked = scheduleSlots[session.date][session.time][session.room]['locked'];
        }

        if(isLocked){
            $("<button/>").addClass("btn btn-inverse button-unlock").html("Unlock").appendTo($(element));
        } else {
            var $lockButton = $("<button/>").addClass("btn btn-inverse button-lock").html("Lock");
            if (type == "scheduled") {
                $("<button/>").addClass("btn btn-info button-propose-scheduled").html("Propose Move").appendTo($(element));
                $("<button/>").addClass("btn btn-danger button-unschedule").html("Unschedule").appendTo($(element));
                $lockButton.appendTo($(element));
            } else if (type == "unscheduled") {
                $("<button/>").addClass("btn btn-info button-propose-unscheduled").html("Propose Schedule").appendTo($(element));
            } else if (type == "empty") {
                $("<button/>").addClass("btn btn-info button-propose-empty").html("Propose Schedule").appendTo($(element));
                $lockButton.appendTo($(element));
            }

            if (typeof session !== "undefined" && session != null && typeof session.submissions !== "undefined" && session.submissions != null && session.submissions.length > 1) {
                $("<button/>").addClass("btn btn-inverse button-paper-reorder").html("Reorder").appendTo($(element));
            }
        }

        // html += " <div class='conflicts'/>";
        $("<div/>").addClass("conflicts").appendTo($(element));

        if (typeof session !== "undefined" && session != null && typeof session.submissions !== "undefined" && session.submissions != null) {
            $(element).append(getSubmissionList("view", session));
            // $list.appendTo($(element));
        }
        return element;
    }

    function _getCancelButton(){
        // return "  <button class='btn move-cancel-button'>Cancel Move</button>";
        return $("<button/>").addClass("btn move-cancel-button").html("Cancel Move");
    }

    // get html for a session in the move mode
    function _getMoveSessionDetail(type, session, srcType){
        var element = document.createElement("div");
        var $cell = null;
        if (typeof session.id === "undefined")
            $cell = findCellByDateTimeRoom(session.date, session.time, session.room);
        else
            $cell = findCellByID(session.id);

        var isLocked = false;
        if (type != "unscheduled" && typeof session !== "undefined" && session != null){
            isLocked = scheduleSlots[session.date][session.time][session.room]['locked'];
        }
        // console.log("ISLOCKED", isLocked);

        // console.log("src:", srcType, "dst:", type);
        if (srcType == "scheduled"){
            if (type == "scheduled"){
                if (isLocked)
                    $("<div/>").addClass("alert alert-info").append("<strong>This is a locked session. Unlock to change the schedule.</strong>").appendTo($(element));
                else
                    $("<button/>").attr("id", "swap-button").addClass("btn btn-primary").attr("data-session-id", session.id).html("Swap with this session").appendTo($(element));
                $(element).append($(_getCancelButton())).append("<br>").append(outerHTML($cell.find(".detail .conflicts")[0])).append(getSubmissionList("move", session));

                // html +=  "<button class='btn btn-primary' id='swap-button' data-session-id='" + id 
                //   + "'>Swap with this session</button>" + _getCancelButtonHTML() + "<br>"
                //   + $(this).find(".detail .conflicts")[0].outerHTML
                //   + $(this).find(".detail ul")[0].outerHTML;
            } else if (type == "unscheduled"){
                // console.log("Not supported");
                /*
                html +=  "<button class='btn btn-primary' id='swap-button' data-session-id='" + id 
                  + "'>Swap with this session</button>" + _getCancelButtonHTML() + "<br>"
                  + $(this).find(".detail .conflicts")[0].outerHTML
                  + $(this).find(".detail ul")[0].outerHTML;
                */
            } else if (type == "empty"){
                if (isLocked)
                    $("<div/>").addClass("alert alert-info").append("<strong>This is a locked session. Unlock to change the schedule.</strong>").appendTo($(element));
                else {
                    $("<button/>").attr("id", "move-button").addClass("btn btn-primary")
                    .attr("data-date", session.date).attr("data-time", session.time).attr("data-room", session.room).html("Move to this slot").appendTo($(element));
                }
                $(element).append($(_getCancelButton())).append("<br>").append(outerHTML($cell.find(".detail .conflicts")[0]));

                // html +=  "<button class='btn btn-primary' id='move-button'" 
                //  + "data-date='"+$(this).data("date")+"' data-time='"+$(this).data("time")+"' data-room='"+$(this).data("room")
                //  +"'>Move to this slot</button>" + _getCancelButtonHTML() + "<br>"
                //  + $(this).find(".detail .conflicts")[0].outerHTML;
            } 
        } else if (srcType == "unscheduled") {
            if (type == "scheduled"){
                if (isLocked)
                    $("<div/>").addClass("alert alert-info").append("<strong>This is a locked session. Unlock to change the schedule.</strong>").appendTo($(element));
                else
                    $("<button/>").attr("id", "swap-with-unscheduled-button").addClass("btn btn-primary").attr("data-session-id", session.id).html("Swap with this session").appendTo($(element));
                $(element).append($(_getCancelButton())).append("<br>").append(outerHTML($cell.find(".detail .conflicts")[0])).append(getSubmissionList("move", session));

                // html +=  "<button class='btn btn-primary' id='swap-with-unscheduled-button' data-session-id='" + id 
                //   + "'>Swap with this session</button>" + _getCancelButtonHTML() + "<br>"
                //   + $(this).find(".detail .conflicts")[0].outerHTML
                //   + $(this).find(".detail ul")[0].outerHTML;                            
            } else if (type == "unscheduled"){
                // console.log("Not supported");
            } else if (type == "empty"){
                if (isLocked)
                    $("<div/>").addClass("alert alert-info").append("<strong>This is a locked session. Unlock to change the schedule.</strong>").appendTo($(element));
                else{
                    $("<button/>").attr("id", "schedule-button").addClass("btn btn-primary")
                    .attr("data-date", session.date).attr("data-time", session.time).attr("data-room", session.room).html("Schedule in this slot").appendTo($(element));
                }
                $(element).append($(_getCancelButton())).append("<br>").append(outerHTML($cell.find(".detail .conflicts")[0]));

                // html +=  "<button class='btn btn-primary' id='schedule-button'" 
                //  + "data-date='"+$(this).data("date")+"' data-time='"+$(this).data("time")+"' data-room='"+$(this).data("room")
                //  +"'>Schedule in this slot</button>" + _getCancelButtonHTML() + "<br>"
                //  + $(this).find(".detail .conflicts")[0].outerHTML;     
            }
        } else if (srcType == "empty") {
            if (type == "scheduled"){
                if (isLocked)
                    $("<div/>").addClass("alert alert-info").append("<strong>This is a locked session. Unlock to change the schedule.</strong>").appendTo($(element));
                else
                    $("<button/>").attr("id", "move-button").addClass("btn btn-primary").attr("data-session-id", session.id).html("Move this session").appendTo($(element));
                $(element).append($(_getCancelButton())).append("<br>").append(outerHTML($cell.find(".detail .conflicts")[0])).append(getSubmissionList("move", session));

                // html +=  "<button class='btn btn-primary' id='move-button' data-session-id='" + id 
                //   + "'>Move this session</button>" + _getCancelButtonHTML() + "<br>"
                //   + $(this).find(".detail .conflicts")[0].outerHTML
                //   + $(this).find(".detail ul")[0].outerHTML;                           
            } else if (type == "unscheduled"){
                if (isLocked)
                    $("<div/>").addClass("alert alert-info").append("<strong>This is a locked session. Unlock to change the schedule.</strong>").appendTo($(element));
                else
                    $("<button/>").attr("id", "schedule-button").addClass("btn btn-primary").attr("data-session-id", session.id).html("Schedule this session").appendTo($(element));
                $(element).append($(_getCancelButton())).append("<br>").append(outerHTML($cell.find(".detail .conflicts")[0])).append(getSubmissionList("move", session));

                // html +=  "<button class='btn btn-primary' id='schedule-button' data-session-id='" + id 
                //       + "'>Schedule this session</button>" + _getCancelButtonHTML() + "<br>"
                //       + $(this).find(".detail .conflicts")[0].outerHTML
                //       + $(this).find(".detail ul")[0].outerHTML;
            } else if (type == "empty"){
                // console.log("Not supported");   
            }
        }
        //console.log(element.outerHTML);
        return element;
    }

    // get html for a session in the paper move mode
    function _getPaperMoveSessionDetail(type, session, srcType){
        var element = document.createElement("div");

        if (srcType == "paper-scheduled"){
            if (type == "scheduled"){
                //$("<button/>").attr("id", "swap-button").addClass("btn btn-primary").data("session-id", session.id).html("Swap with this session").appendTo($(element));
                $(element).append($(_getCancelButton())).append("<br>").append(getSubmissionList("paperMove", session, srcType));
            } else if (type == "unscheduled"){
                $(element).append($(_getCancelButton())).append("<br>").append(getSubmissionList("paperMove", session, srcType));
            } else if (type == "empty"){
                //$("<button/>").attr("id", "move-button").addClass("btn btn-primary")
                //    .data("date", session.date).data("time", session.time).data("room", session.room).html("Move to this slot").appendTo($(element));
                $(element).append($(_getCancelButton())).append("<br>").append(getSubmissionList("paperMove", session, srcType));
            } 

        } else if (srcType == "paper-unscheduled") {
            if (type == "scheduled"){
                //$("<button/>").attr("id", "swap-with-unscheduled-button").addClass("btn btn-primary").data("session-id", session.id).html("Swap with this session").appendTo($(element));
                $(element).append($(_getCancelButton())).append("<br>").append(getSubmissionList("paperMove", session, srcType));                           
            } else if (type == "unscheduled"){
                $(element).append($(_getCancelButton())).append("<br>").append(getSubmissionList("paperMove", session, srcType));    
            } else if (type == "empty"){
                //$("<button/>").attr("id", "schedule-button").addClass("btn btn-primary")
                //    .data("date", session.date).data("time", session.time).data("room", session.room).html("Schedule in this slot").appendTo($(element));
                $(element).append($(_getCancelButton())).append("<br>").append(getSubmissionList("paperMove", session, srcType));    
            }

        } else if (srcType == "paper-empty") {
            if (type == "scheduled"){
                //$("<button/>").attr("id", "move-button").addClass("btn btn-primary").data("session-id", session.id).html("Move this session").appendTo($(element));
                $(element).append($(_getCancelButton())).append("<br>").append(getSubmissionList("paperMove", session, srcType));                        
            } else if (type == "unscheduled"){
                //$("<button/>").attr("id", "schedule-button").addClass("btn btn-primary").data("session-id", session.id).html("Schedule this session").appendTo($(element));
                $(element).append($(_getCancelButton())).append("<br>").append(getSubmissionList("paperMove", session, srcType));
            } else if (type == "empty"){
                $(element).append($(_getCancelButton())).append("<br>").append(getSubmissionList("paperMove", session, srcType));
                // console.log("Not supported");   
            }
        }
        //console.log(element.outerHTML);
        return element;
    }

    // Getting html for session details
    function getSessionDetail(mode, type, session, srcType){
        var element;
        if (mode == "view")
           element = _getViewSessionDetail(type, session);
        else if (mode == "move")
           element = _getMoveSessionDetail(type, session, srcType);
        else if (mode == "paperMove")
           element = _getPaperMoveSessionDetail(type, session, srcType);
        else
           return "";
        return outerHTML(element);
    }

    // get html for a submission in the view mode
    function _getViewSubmissionDetail(type, submission, session){
        var element; 
        var isLocked = false;
        // if the session is a single submission type special session (sig, panel, bof, ...), do not display buttons
        var isSpecial = false;
        if (typeof session !== "undefined" && session != null){
            if (!(session.id in unscheduled)) {
                isLocked = scheduleSlots[session.date][session.time][session.room]['locked'];
            }
            isSpecial = isSpecialSession(session);
        }

        if (type == "scheduled") {
            var stype = (submission.type == "paper") ? submission.subtype : submission.type;
            element = document.createElement("li");
            $(element).addClass("submission").attr("id", submission.id);
            $("<span/>").addClass("reorder-icon").appendTo($(element));
            $("<span/>").addClass("submission-type").html(stype).appendTo($(element));
            $("<span/>").addClass("submission-id").html(submission.id).appendTo($(element));
            if (submission.bestPaperAward)
                    $("<span/>").addClass("awards").html("<img src='img/best-paper.png' class='icon'/>").appendTo($(element));
                if (submission.bestPaperNominee)
                    $("<span/>").addClass("awards").html("<img src='img/nominee.png' class='icon'/>").appendTo($(element));
            if (!isLocked && !isSpecial){
                $("<button/>").addClass("btn btn-mini button-paper-unschedule").html("Unschedule").appendTo($(element));
                $("<button/>").addClass("btn btn-mini button-paper-propose-scheduled").html("Propose Move").appendTo($(element));
            }
            $("<br/>").appendTo($(element));
            $("<span/>").addClass("submission-title").html(submission.title).appendTo($(element));
            $("<br/>").appendTo($(element));
            $("<span/>").addClass("submission-authors").html(displayAuthors(submission.authors)).appendTo($(element));

            // html += "<li class='submission' id='" + submission.id
            //      +"'><span class='reorder-icon'/> <span class='submission-type'>" + type + "</span> <button class='btn btn-mini button-paper-unschedule'>Unschedule</button> <button class='btn btn-mini button-paper-propose-scheduled'>Propose Move</button><br>" 
            //      + "<strong>" + submission.title + "</strong><br>"
            //      + displayAuthors(submission.authors) + "</li>";
        } else if (type == "unscheduled") {
            element = document.createElement("div");
            $(element).attr("id", submission.id);
            //$("<span/>").attr("id", "popover-submission-" + submission.id).addClass("hidden").appendTo($(element));
            if (!isLocked && !isSpecial)
                $("<button/>").addClass("btn btn-mini button-paper-propose-unscheduled").html("Propose Move").appendTo($(element));
            $("<div/>").addClass("conflicts").appendTo($(element));
            $("<br/>").appendTo($(element));
            if (submission.bestPaperAward)
                $("<span/>").addClass("awards").html("<img src='img/best-paper.png' class='icon'/>").appendTo($(element));
                if (submission.bestPaperNominee)
                $("<span/>").addClass("awards").html("<img src='img/nominee.png' class='icon'/>").appendTo($(element));
            $("<span/>").html("<strong>Authors</strong>: " + displayAuthors(submission.authors)).appendTo($(element));

            // console.log(typeof submission, submission == null);
            // if (typeof submission !== "undefined" && submission != null && typeof submission.id !== "undefined" && submission.id != null) {
            //      console.log( typeof submission.id, submission.id);
            //      html += "<span id='popover-session-" + submission.id + "' class='hidden'/>";
            // }
            // html += "<button class='btn btn-info button-paper-propose-unscheduled'>Propose Schedule</button>";
            // html += " <div class='conflicts'/>";
            // html += "<br><strong>Authors</strong>: " + displayAuthors(submission.authors);
        } else if (type == "empty") {
            if (isLocked || isSpecial){
                element = document.createElement("div");
            } else {
                element = document.createElement("li");
                $(element).addClass("submission-empty");
                $("<button/>").addClass("btn btn-small button-paper-propose-empty").html("<span class='icon-plus'/> Propose a paper to add").appendTo($(element));
            }
            // html += "<li class='submission-empty'><button class='btn btn-small button-paper-propose-empty'><span class='icon-plus'/> Propose a paper to add</button></li>";
        } else 
            document.createElement("div");
        return element;
    }

    // get html for a submission in the move mode
    function _getMoveSubmissionDetail(type, submission){
        var element;

        if (type == "scheduled"){
            var stype = (submission.type == "paper") ? submission.subtype : submission.type;
            element = document.createElement("li");
            $(element).addClass("submission").attr("id", submission.id)
            $("<span/>").addClass("reorder-icon").appendTo($(element));
            $("<span/>").addClass("submission-type").html(stype).appendTo($(element));
            $("<span/>").addClass("submission-id").html(submission.id).appendTo($(element));
            if (submission.bestPaperAward)
                $("<span/>").addClass("awards").html("<img src='img/best-paper.png' class='icon'/>").appendTo($(element));
            if (submission.bestPaperNominee)
                $("<span/>").addClass("awards").html("<img src='img/nominee.png' class='icon'/>").appendTo($(element));
            $("<br/>").appendTo($(element));
            $("<span/>").addClass("submission-title").html(submission.title).appendTo($(element));
            $("<br/>").appendTo($(element));
            $("<span/>").addClass("submission-authors").html(displayAuthors(submission.authors)).appendTo($(element));

            // html += "<li class='submission' id='" + submission.id
            //     +"'><span class='reorder-icon'/> <span class='submission-type'>" + stype + "</span> <br>" 
            //     + "<strong>" + submission.title + "</strong><br>"
            //     + displayAuthors(submission.authors) + "</li>";
        } else if (type == "unscheduled") {
            element = document.createElement("div");
            // console.log("return nothing");
        } else if (type == "empty") {
            element = document.createElement("div");
            // console.log("return nothing");
        }
        return element;
    }

    // get html for a submission in the paper move mode
    function _getPaperMoveSubmissionDetail(type, submission, srcType, session){
        var element;
        var proposedList = [];
        var isProposed = false;
        // console.log("src:", srcType, "dst:", type);

        // unscheduled: session null, submission id
        if (type == "unscheduled" && session == null){
            isProposed = typeof $("#"+submission.id).attr("data-proposed-swap-paper") !== "undefined";
            // console.log(null, submission.id, isProposed);
        // empty: session id, submission null
        } else if (type == "empty" && submission == null){
            var $session = findCellByID(session.id);
            if (typeof $session.attr("data-proposed-swap-paper") === "undefined")
                isProposed = false;
            else {
                proposedList = $session.attr("data-proposed-swap-paper").split(",");
                // because attr returns all strings, "null" not null is returned.
                isProposed = $.inArray("null", proposedList) !== -1;
            }
            // console.log(session.id, null, isProposed, proposedList);
        // scheduled: session id, submission id
        } else if (type == "scheduled" && session != null && submission != null){
            var $session = findCellByID(session.id);
            if (typeof $session.attr("data-proposed-swap-paper") === "undefined")
                isProposed = false;
            else {
                proposedList = $session.attr("data-proposed-swap-paper").split(",");
                isProposed = $.inArray(submission.id, proposedList) !== -1;
            }
            // console.log(session.id, submission.id, isProposed);
        } else {
            console.log("IMPOSSIBLE");
        }

        if (srcType == "paper-scheduled"){
            if (type == "scheduled"){
                var stype = (submission.type == "paper") ? submission.subtype : submission.type;
                element = document.createElement("li");
                $(element).addClass("submission").attr("id", submission.id);
                $("<span/>").addClass("reorder-icon").appendTo($(element));
                $("<span/>").addClass("submission-type").html(stype).appendTo($(element));
                $("<span/>").addClass("submission-id").html(submission.id).appendTo($(element));
                if (submission.bestPaperAward)
                    $("<span/>").addClass("awards").html("<img src='img/best-paper.png' class='icon'/>").appendTo($(element));
                if (submission.bestPaperNominee)
                    $("<span/>").addClass("awards").html("<img src='img/nominee.png' class='icon'/>").appendTo($(element));
                if (isProposed)
                    $("<button/>").addClass("btn btn-mini button-paper-swap").html("Swap with this paper").appendTo($(element));
                $("<br/>").appendTo($(element));
                $("<span/>").addClass("submission-title").html(submission.title).appendTo($(element));
                $("<br/>").appendTo($(element));
                $("<span/>").addClass("submission-authors").html(displayAuthors(submission.authors)).appendTo($(element));

            } else if (type == "unscheduled"){
                element = document.createElement("div");
                // console.log("No return");

            } else if (type == "empty"){
                // TODO: maybe also save date, time, room, and order info
                if (isProposed){
                    element = document.createElement("li");
                    $(element).addClass("submission-empty");
                    $("<button/>").addClass("btn btn-small button-paper-move").html("<span class='icon-plus'/> Move to this slot").appendTo($(element));
                } else {
                    element = document.createElement("div");
                }
            } 
        } else if (srcType == "paper-unscheduled") {
            if (type == "scheduled"){
                var stype = (submission.type == "paper") ? submission.subtype : submission.type;
                element = document.createElement("li");
                $(element).addClass("submission").attr("id", submission.id);
                $("<span/>").addClass("reorder-icon").appendTo($(element));
                $("<span/>").addClass("submission-type").html(stype).appendTo($(element));
                $("<span/>").addClass("submission-id").html(submission.id).appendTo($(element));
                if (submission.bestPaperAward)
                    $("<span/>").addClass("awards").html("<img src='img/best-paper.png' class='icon'/>").appendTo($(element));
                if (submission.bestPaperNominee)
                    $("<span/>").addClass("awards").html("<img src='img/nominee.png' class='icon'/>").appendTo($(element));
                if (isProposed)
                    $("<button/>").addClass("btn btn-mini button-paper-swap-with-unscheduled").html("Swap with this paper").appendTo($(element));
                $("<br/>").appendTo($(element));
                $("<span/>").addClass("submission-title").html(submission.title).appendTo($(element));
                $("<br/>").appendTo($(element));
                $("<span/>").addClass("submission-authors").html(displayAuthors(submission.authors)).appendTo($(element));
                        
            } else if (type == "unscheduled"){
                element = document.createElement("div");
                // console.log("No return");
            } else if (type == "empty"){
                // TODO: maybe also save date, time, room, and order info
                if (isProposed) {
                    element = document.createElement("li");
                    $(element).addClass("submission-empty");
                    $("<button/>").addClass("btn btn-small button-paper-schedule").html("<span class='icon-plus'/> Schedule in this slot").appendTo($(element));
                } else {
                    element = document.createElement("div");
                }
            }
        } else if (srcType == "paper-empty") {
            if (type == "scheduled"){
                var stype = (submission.type == "paper") ? submission.subtype : submission.type;
                element = document.createElement("li");
                $(element).addClass("submission").attr("id", submission.id);
                $("<span/>").addClass("reorder-icon").appendTo($(element));
                $("<span/>").addClass("submission-type").html(stype).appendTo($(element));
                $("<span/>").addClass("submission-id").html(submission.id).appendTo($(element));
                if (submission.bestPaperAward)
                    $("<span/>").addClass("awards").html("<img src='img/best-paper.png' class='icon'/>").appendTo($(element));
                if (submission.bestPaperNominee)
                    $("<span/>").addClass("awards").html("<img src='img/nominee.png' class='icon'/>").appendTo($(element));
                if (isProposed)
                    $("<button/>").addClass("btn btn-mini button-paper-move").html("Move this paper").appendTo($(element));
                $("<br/>").appendTo($(element));
                $("<span/>").addClass("submission-title").html(submission.title).appendTo($(element));
                $("<br/>").appendTo($(element));
                $("<span/>").addClass("submission-authors").html(displayAuthors(submission.authors)).appendTo($(element));
                      
            } else if (type == "unscheduled"){
                // TODO: maybe also save date, time, room, and order info
                if (isProposed) {
                    element = document.createElement("li");
                    $(element).addClass("submission-empty").css("list-style-type", "none");;
                    $("<button/>").addClass("btn btn-small button-paper-schedule").html("<span class='icon-plus'/> Schedule this paper").appendTo($(element));
                } else {
                    element = document.createElement("div");
                }

            } else if (type == "empty"){
                element = document.createElement("div");
                // console.log("No return");   
            }
        }

        if (isProposed)
            $(element).addClass("proposed-swap-paper");

        return element;
    }

    // Getting html for submission details
    function getSubmissionDetail(mode, type, submission, srcType, session){
        var element;
        if (mode == "view")
           element = _getViewSubmissionDetail(type, submission, session);
        else if (mode == "move")
           element = _getMoveSubmissionDetail(type, submission);
        else if (mode == "paperMove")
           element = _getPaperMoveSubmissionDetail(type, submission, srcType, session);
        else
           return "";
        return outerHTML(element);
    }

     // For each session item, render session display
    function getSessionCell(type, session, slotDate, slotTime, slotRoom){
	    var slotDate = typeof slotDate !== "undefined" ? slotDate : null;
        var slotTime = typeof slotTime !== "undefined" ? slotTime : null;
        var slotRoom = typeof slotRoom !== "undefined" ? slotRoom : null;
        var cell = document.createElement('td');
        $(cell).addClass("cell slot").append("<div class='user'/><div class='title'/><div class='display'/><div class='conflicts'/>");

        // Empty Session
		if (type == "empty" || session == -1){
            //console.log("empty", slotDate, slotTime, slotRoom);
            if(scheduleSlots[slotDate][slotTime][slotRoom]['locked'])
                $(cell).find(".title").addClass("locked");

            var detail = document.createElement("div");
            $(detail).hide()
                 .addClass("detail")
                 .html(getSessionDetail("view", type, session));
            $(cell)
                 //.attr("id", "session-" + session.id)
                 //.data("session-id", session.id)
                 .addClass("empty")
                 .attr("data-date", slotDate).attr("data-time", slotTime).attr("data-room", slotRoom)                     
                 .append($(detail));

            $(cell).find(".title").append("<i class='icon-plus'></i>")     

            // Unavailable / Locked Session                         
        } else if (type == "unavailable" || session == "") {
            $(cell).addClass("unavailable");
       
        // Scheduled / Unscheduled Session
        } else {
            if(type !== "unscheduled" && scheduleSlots[session.date][session.time][session.room]['locked'])
                $(cell).find(".title").addClass("locked");

            var detail = document.createElement("div");
            $(detail).hide()
                .addClass("detail")
                .html(getSessionDetail("view", type, session));
	 	
            $(cell).attr("id", "session-" + session.id)
                .addClass(type)
                .attr("data-session-id", session.id)                 
                .attr("data-date", slotDate).attr("data-time", slotTime).attr("data-room", slotRoom)
                .append($(detail));
            
            if (typeof session.title !== "undefined")
                $(cell).find(".title").html(session.title);
		} 
		return cell;
    }

     // For each submission item, render submission display, only to be used for the unscheduled papers panel at the top
    function getSubmissionCell(type, submission){
        //var slotDate = typeof slotDate !== "undefined" ? slotDate : null;
        //var slotTime = typeof slotTime !== "undefined" ? slotTime : null;
        //var slotRoom = typeof slotRoom !== "undefined" ? slotRoom : null;
        var cell = document.createElement('td');
        $(cell).addClass("cell slot-paper")
            .append("<div class='user'/><div class='title'/><div class='display'/><div class='conflicts'/>");

        // console.log("session", typeof session);

        // Empty Session
        if (type == "empty" || submission == -1){   
            console.log("empty submission display: not used");
        // Unavailable / Locked Session                         
        } else if (type == "unavailable" || submission == "") {
            console.log("unavailable submission display: not used");
        // Scheduled
        } else if (type == "scheduled") {
            console.log("scheduled submission display: not used");
        // Unscheduled
        } else {
            // if(type !== "unscheduled" && scheduleSlots[session.date][session.time][session.room]['locked'])
            //     $(cell).find(".title").addClass("locked");

            // var detail = document.createElement("div");
            // $(detail).hide()
            //      .addClass("detail")
            //      .html(getSessionDetail(type, session));
           
            $(cell).attr("id", "" + submission.id)
                 .addClass(type);
                 //.data("submission-id", submission.id)
                 // .append($(detail));
            
            if (typeof submission.title !== "undefined")
                 $(cell).find(".title").html(submission.title);
            
       } 
       return cell;
    }

     function displayAuthors(authors){
          var html = "";      
          $.each(authors, function(i, author){
               html += author.firstName + " " + author.lastName + ", ";
          }); 
          // remove the trailing comma at the end
          return html.slice(0, -2);
     }



     // Display textually the slot title. (slot data structure)
     // When session exists: Name of the session
     // When session is empty: show date, time, room
     function displaySlotTitle(slot) {
          if (slot.session === null) {
               return slot.date + " " + slot.time + " " + slot.room;
          } else {
               return allSessions[slot.session].title;
          }
     }

     // Display textually the session title.
     // When session exists: Name of the session
     // When session is empty: show date, time, room
     function displaySessionTitle(session) {
          if (session.hasClass("empty")) {
               return session.attr("data-date") + " " + session.attr("data-time") + " " + session.attr("data-room");
          } else {
               //console.log(session);
               return allSessions[getID(session)].title;
          }
     }

    // Update the unscheduled session count just by looking at the DOM nodes, not the database
     function updateUnscheduledCount(){
          count = $("#unscheduled .slot").length;
          $("#unscheduled-count").html(count);

          count = $("#unscheduled-papers .slot-paper").length;
          $("#unscheduled-papers-count").html(count);
     }


     // Display the unscheduled panel
     function displayUnscheduled(){
          var cell = null;
          keys(unscheduled).map(function(id){
               cell = getSessionCell("unscheduled", allSessions[id]);
               $("#unscheduled tr").append(cell);         
          });

          keys(unscheduledSubmissions).map(function(id){
               cell = getSubmissionCell("unscheduled", allSubmissions[id]);
               $("#unscheduled-papers tr").append(cell);         
          });

          updateUnscheduledCount();
     }


     // Display all scheduled sessions in the main grid
     function displayScheduled(){
          var days = {
            "Sunday": 0,
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6
          }
          //var orderedDates = keys(schedule).sort(function(a,b) {return new Date(a) - new Date(b);});
          //var orderedRooms = keys(allRooms).sort(function(a,b) {return allRooms[a] - allRooms[b];});
          var orderedDates = keys(schedule).sort(function(a,b) {return days[a] - days[b];});
          var orderedRooms = keys(allRooms).sort(function(a, b){
	       return desiredRoomOrder.indexOf(a) - desiredRoomOrder.indexOf(b);
	      });

          var i, cell;
          // Table Header
          var table = document.createElement('table'); 
          /*
          var header = document.createElement('tr');
          var firstcell = $(document.createElement('td')).addClass("cell header-col").append("<div>Room/<br>Time</div>");
          //var secondcell = $(document.createElement('td')).addClass("cell").append("<div>Conflicts</div>");
          $(header).addClass("header-row").append(firstcell); //.append(secondcell);
          for(var i = 0; i < orderedRooms.length; i++){
               var cell = document.createElement('td');
               $(cell).addClass("cell header-cell").append("<div>" + orderedRooms[i] + "</div>");
               $(header).append(cell);
          }
          $("#program").append(header);
          */
          addHeaderRow(orderedRooms);

          // Main content
          $.each(orderedDates, function(index, date){
            
            var orderedTimes = keys(schedule[date]).sort(function(a,b) {return a.split(":")[0] - b.split(":")[0];});
            $.each(orderedTimes, function(index2, time){
                // add an extra row for daily borders
                if (index2 == 0) {
                    addBorderRow(orderedRooms);
                    // var borderRow = document.createElement('tr');
                    // var borderSlot = document.createElement('td');
                    // $(borderSlot).attr("colspan", orderedRooms.length+1).addClass("header-day-border");
                    // $(borderRow).append(borderSlot);
                    // $('#program').append(borderRow);
                    //$(slot).addClass("header-day-border");
                }
                var row = document.createElement('tr');
                var slot = document.createElement('td');
//              var conflicts = document.createElement('td');
                $(slot).addClass("cell header-col").append(shortenDate(date) + " " + time);

                $(row).append(slot);
                //console.log(date, time);
                $.each(orderedRooms, function(index3, room){
                    var sessions = schedule[date][time][room];
                    //console.log(schedule[date][time][room]);
                    // if this room has an associated session, display it.
                    if (typeof sessions !== "undefined") {

                        if (keys(sessions).length === 0){
                            cell = getSessionCell("empty", null, date, time, room);
                        } else {
                            $.each(sessions, function(id, session){
                                cell = getSessionCell("scheduled", session, date, time, room);
                            });
                        }
                    } else { // otherwise, mark it unavailable.
                        cell = getSessionCell("unavailable", null);
                    }
                    $(row).append(cell);                    
                });

                $('#program').append(row);

            });
          });

                    // var borderRow = document.createElement('tr');
                    // var borderSlot = document.createElement('td');
                    // $(borderSlot).attr("colspan", orderedRooms.length+1).addClass("header-day-border");
                    // $(borderRow).append(borderSlot);
                    // $('#program').append(borderRow);

            addBorderRow(orderedRooms);
            addHeaderRow(orderedRooms);

  
     }

     function addHeaderRow(orderedRooms){
          var header = document.createElement('tr');
          var firstcell = $(document.createElement('td')).addClass("cell header-col").append("<div>Room/<br>Time</div>");
          //var secondcell = $(document.createElement('td')).addClass("cell").append("<div>Conflicts</div>");
          $(header).addClass("header-row").append(firstcell); //.append(secondcell);
          for(var i = 0; i < orderedRooms.length; i++){
               var cell = document.createElement('td');
               $(cell).addClass("cell header-cell").append("<div>" + orderedRooms[i] + "</div>");
               $(header).append(cell);
          }
          $("#program").append(header);       
     }

     function addBorderRow(orderedRooms){
            var borderRow = document.createElement('tr');
            var borderSlot = document.createElement('td');
            $(borderSlot).attr("colspan", orderedRooms.length+1).addClass("header-day-border");
            $(borderRow).append(borderSlot);
            $('#program').append(borderRow);
     }

    $(document).ready(function() {
        $("body").addClass("loading"); 
        Statusbar.initialize(); 
	    
        // triggered once initialize is complete
        // initialize() is async, thus the bind
        $(document).bind("fullyLoaded", function(){
            displayScheduled();
            displayUnscheduled();
            Sidebar.initialize(); 
            Searchbox.initialize();
            Polling.initialize();
            // default is view mode.
            ViewMode.initialize();   
            UnscheduledPanel.initialize(); 
            Conflicts.initialize();
            $(".user-display").append("<span class='icon-user icon-white'/>").append(getUsernameByUID(userData.id));
            Statusbar.display("Select a session for scheduling options and more information.");
            $("body").removeClass("loading");             
        });
        initialize();
	});


