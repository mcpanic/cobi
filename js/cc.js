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

    $(document).ready(function() {

        $("body").addClass("loading"); 
        // Statusbar.initialize(); 
         
        // triggered once initialize is complete
        // initialize() is async, thus the bind
        $(document).bind("fullyLoaded", function(){
            Comp.initialize();

            CCOps.initialize();
            Expression.initialize();

            $(".user-display").append("<span class='icon-user icon-white'/>").append(getUsernameByUID(userData.id));
            // Statusbar.display("Select a session for scheduling options and more information.");
            $("body").removeClass("loading");             
        });
        initialize();
	});
