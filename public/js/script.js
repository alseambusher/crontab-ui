/*********** MessageBox ****************/
// simply show info.  Only close button
function infoMessageBox(message, title){
	$("#modal-body").html(message);
	$("#modal-title").html(title);
	$("#modal-button").hide();
	$("#popup").modal('show');
}
// modal with full control
function messageBox(body, title, ok_text, close_text, callback){
	$("#modal-body").html(body);
	$("#modal-title").html(title);
	if (ok_text) $("#modal-button").html(ok_text);
	$("#modal-button").show();
	if(close_text) $("#modal-close-button").html(close_text);
	$("#modal-button").click(callback);
	$("#popup").modal("show");
}


/*********** crontab actions ****************/

function deleteJob(_id){
	// TODO fix this. pass callback properly
	messageBox("<p> Do you want to delete this Job? </p>", "Confirm delete", null, null, function(){
		console.log("delete job");
	});
}

function stopJob(_id){
	messageBox("<p> Do you want to stop this Job? </p>", "Confirm stop job", null, null, function(){
		console.log("stop job");
	});
}

function startJob(_id){
	messageBox("<p> Do you want to start this Job? </p>", "Confirm start job", null, null, function(){
		console.log("start job");
	});
}

function editJob(_id){
	var job = null;
	crontabs.forEach(function(crontab){
		if(crontab._id == _id)
			job = crontab;
	});
	if(job){
		$("#job").modal("show");
		$("#job-name").val(job.name);
		$("#job-command").val(job.command);
		// if macro not used
		if(job.schedule.indexOf("@") != 0){
			var components = job.schedule.split(" ");
			$("#job-minute").val(components[0]);
			$("#job-hour").val(components[1]);
			$("#job-day").val(components[2]);
			$("#job-month").val(components[3]);
			$("#job-week").val(components[4]);
		}
		schedule = job.schedule;
		job_command = job.command;
		job_string();
	}

	$("#job-save").click(function(){
		// TODO good old boring validations
		$.post("/save", {name: $("#job-name").val(), command: job_command , schedule: schedule, _id: _id}, function(){
			location.reload();
		})
	});
}

function newJob(){
	schedule = ""
	job_command = ""
	$("#job-minute").val("*");
	$("#job-hour").val("*");
	$("#job-day").val("*");
	$("#job-month").val("*");
	$("#job-week").val("*");

	$("#job").modal("show");
	$("#job-name").val("");
	$("#job-command").val("");
	job_string();
	$("#job-save").click(function(){
		// TODO good old boring validations
		$.post("/save", {name: $("#job-name").val(), command: job_command , schedule: schedule, _id: -1}, function(){
			location.reload();
		})
	});
}


// script corresponding to job popup management
var schedule = "";
var job_command = "";
function job_string(){
	$("#job-string").val(schedule + " " + job_command);
	return schedule + " " + job_command;
}

function set_schedule(){
	schedule = $("#job-minute").val() + " " +$("#job-hour").val() + " " +$("#job-day").val() + " " +$("#job-month").val() + " " +$("#job-week").val();
	job_string();
}

