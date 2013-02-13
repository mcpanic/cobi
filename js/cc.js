     var allRooms = [];

     function keys(obj){
       var keys = [];

       for(var key in obj){
		   if(obj.hasOwnProperty(key)){
		       keys.push(key);
		   }
       }
       return keys;
     }

     function getAllRooms(){
          var rooms = {};
          var index = 0;
          for(var day in sessions){
               for(var time in sessions[day]){
                for(var room in sessions[day][time]){
                    if(room in rooms){
                    }else{
               	 rooms[room] = index;
               	 index++;
                    }
                }
               }
          }
	 	return rooms;
     }


function register(){
    var mappingList = {
        "session-has-award":{
            name:"session-has-award",
            level:"session",
            key:"hasAward",
            comp:Comp.booleanEquals,
            display:"that include best papers",
            hasValue:true
        },
        "session-has-honorable-mention":{
            name:"session-has-honorable-mention",
            level:"session",
            key:"hasHonorableMention",
            comp:Comp.booleanEquals,
            display:"that include honorable mention papers",
            hasValue:true
        },
        "session-title-is":{
            name:"session-title-is",
            level:"session",
            key:"title",
            comp:Comp.stringEquals,
            display:"whose title is",
            hasValue:true
        },
        "session-title-contains":{
            name:"session-title-contains",
            level:"session",
            key:"title",
            comp:Comp.stringContains,
            display:"whose title contains",
            hasValue:true
        },
        "session-title-starts-with":{
            name:"session-title-starts-with",
            level:"session",
            key:"title",
            comp:Comp.stringStartsWith,
            display:"whose title starts with",
            hasValue:true
        },                
        "session-persona-is":{
            name:"session-persona-is",
            level:"session",
            key:"persona",
            comp:Comp.stringEquals,
            display:"whose persona is",
            hasValue:true
        },
        "session-community-is":{
            name:"session-community-is",
            level:"session",
            key:"persona",
            comp:Comp.stringEquals,
            display:"whose community is",
            hasValue:true
        },        
        "session-venue-is":{
            name:"session-venue-is",
            level:"session",
            key:"venue",
            comp:Comp.stringEquals,
            display:"whose type is",
            hasValue:true
        },        
        "session-venue-is-regular":{
            name:"session-venue-is-regular",
            level:"session",
            key:"venue",
            comp:Comp.sessionTypeRegular,
            display:"that contain papers and notes",
            hasValue:false
        }, 
        "session-venue-is":{
            name:"session-venue-is",
            level:"session",
            key:"venue",
            comp:Comp.sessionTypeSpecial,
            display:"that are non-paper sessions (course, panel, SIG, ...)",
            hasValue:false
        }, 
        "session-duration-full":{
            name:"session-duration-full",
            level:"session",
            key:"duration",
            comp:Comp.numEquals,
            display:"that are fully scheduled",
            hasValue:false
        },   
        "session-duration-over":{
            name:"session-duration-over",
            level:"session",
            key:"duration",
            comp:Comp.numGreaterThan,
            display:"that are over-scheduled",
            hasValue:false
        }, 
        "session-duration-under":{
            name:"session-duration-under",
            level:"session",
            key:"duration",
            comp:Comp.numLessThan,
            display:"that are under-scheduled",
            hasValue:false
        },                                       
    };
    console.log(mappingList);
}


function display(){

          console.log(entities);
          // Entity-begin
          $(".expression .entity-begin").append("<select class='dropdown'/>");
          for (var entity in entities){
               $(".expression .entity-begin .dropdown").append("<option class='" + entity + "'>"+entity+"</option>")
          }          
          //$(".expression .entity-begin .dropdown").chosen();

          $(".expression .entity-begin").change(function(){
               $(".expression .entity-begin-detail .details").html("");
          });

          // Entity-begin-detail
          $(".expression .entity-begin-detail").append("<i class='icon-plus plus-button'/><div class='details'></div>");
          $("body").on("click", ".expression .entity-begin-detail .plus-button", function(){
               $(".expression .entity-begin-detail .details").append("<div class='val-top-div'><select class='dropdown span4'><option/></select></div><br/>");
               for (var attr in entities[$(".expression .entity-begin .dropdown option:selected").val()]){
                    $(".expression .entity-begin-detail .details").find(".dropdown").append("<option class='" + attr + "'>that have the same "+attr+"</option>");
                    
               }
               for (var attr in entities[$(".expression .entity-begin .dropdown option:selected").val()]){
                    $(".expression .entity-begin-detail .details").find(".dropdown").append("<option class='" + attr + "'>whose "+attr+" is </option>");
                    
               }
               //$(".expression .entity-begin-detail .details").find(".dropdown").chosen();
               //$(this).append("that have the same " + );
          });

          $("body").on("change", ".expression .entity-begin-detail .details .val-top-div select", function(){


          //$(".expression .entity-begin-detail .details .val-top-div select").change(function(e){
               //console.log("hello" + $(this).html());
               var entity = $(".expression .entity-begin .dropdown option:selected").val();
               var attr = $(this).find("option:selected").val();               
               console.log(attr);
               $(this).parent().find(".val-div").html("");
               if (attr.indexOf("whose") !== -1) {
                    attr = attr.substring(6, attr.length-3);
                    
                    $(this).parent().append("<div class='val-div'><select class='val-dropdown'><option/></select></div>");
                    for (var i=0; i<entities[entity][attr].length; i++){
                         console.log(entities[entity][attr][i]);
                         $(this).parent().find(".val-div select").append("<option class='" + entities[entity][attr][i] + "'>" + entities[entity][attr][i] + "</option>");                   
                    }
               }
          });

          $(".expression .entity-begin-detail .details .val-div").change(function(e){
               console.log("inside");
               e.preventDefault();
          });

          // Timeroom
          $(".expression .timeroom").append("<select>"
               + "<option>at time</option>"
               + "<option>not at time</option>"
               + "<option>before time</option>"
               + "<option>after time</option>"
               + "<option>in room</option>"
               + "<option>not in room</option>"
               + "<option>near room</option>"
               + "<option>on a day</option>"
               + "<option>before a day</option>"
               + "<option>after a day</option>"
               + "</select>");
          
          var choice = "";
          $("body").on("change", ".expression .timeroom select", function(){
               var attr = $(this).find("option:selected").val();   
               console.log(attr);  
               
               $(".expression .entity-end-attr").html("");
               $(".expression .entity-end-val").html("");
               if (attr.indexOf("time") != -1){
                    choice = "time";
                    console.log(choice);
                    $(".expression .entity-end-attr").append("<select></select>");
               } else if (attr.indexOf("room") != -1){
                    choice = "room";
                    console.log(choice);
                    $(".expression .entity-end-attr").append("<select></select>");
               } else if (attr.indexOf("day") != -1){
                    choice = "date";
                    console.log(choice);
                    $(".expression .entity-end-attr").append("<select></select>");
               }

               $(".expression .entity-end-attr select").append("<option/>");
               for (var item in constraintObjects[choice]){
                         //console.log(constraintObjects[choice][i]);
                         if (item == "mod")
                              continue;
                         $(".expression .entity-end-attr select").append("<option class='" + item + "'>" + item + "</option>");                          
               }

          });

          $("body").on("change", ".expression .entity-end-attr select", function(){
               var attr = $(this).find("option:selected").val();  
               $(".expression .entity-end-val").html("");
               $(".expression .entity-end-val").append(" is ");
               $(".expression .entity-end-val").append("<select></select>");
               console.log(choice, attr);
               $(".expression .entity-end-val select").append("<option/>");
               for (var i=0; i<constraintObjects[choice][attr].length; i++){
                    console.log(constraintObjects[choice][attr][i]);
                    $(".expression .entity-end-val select").append("<option class='" + constraintObjects[choice][attr][i] + "'>" + constraintObjects[choice][attr][i] + "</option>"); 
                         
               }               
          });

          $("select").chosen();     
}


    $(document).ready(function() {

        $("body").addClass("loading"); 
        // Statusbar.initialize(); 
         
        // triggered once initialize is complete
        // initialize() is async, thus the bind
        $(document).bind("fullyLoaded", function(){
            Comp.initialize();
            CCOps.tester();
            display();
            register();
            // displayScheduled();
            // displayUnscheduled();
            // Sidebar.initialize(); 
            // Searchbox.initialize();
            // Polling.initialize();
            // // default is view mode.
            // ViewMode.initialize();   
            // UnscheduledPanel.initialize(); 
            // Conflicts.initialize();
            $(".user-display").append("<span class='icon-user icon-white'/>").append(getUsernameByUID(userData.id));
            // Statusbar.display("Select a session for scheduling options and more information.");
            $("body").removeClass("loading");             
        });
        initialize();
	});
