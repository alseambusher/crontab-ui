/*jshint esversion: 6 */
/*********** MessageBox ****************/
// simply show info.  Only close button
function infoMessageBox(message, title){
	$("#info-body").html(message);
	$("#info-title").html(title);
	$("#info-popup").modal('show');
}
// like info, but for errors.
function errorMessageBox(message) {
	var msg =
		"Operation failed: " + message + ". " +
		"Please see error log for details.";
	infoMessageBox(msg, "Error");
}
// modal with full control
function messageBox(body, title, ok_text, close_text, callback){
	$("#modal-body").html(body);
	$("#modal-title").html(title);
	if (ok_text) $("#modal-button").html(ok_text);
	if(close_text) $("#modal-close-button").html(close_text);
	$("#modal-button").unbind("click"); // remove existing events attached to this
	$("#modal-button").click(callback);
	$("#popup").modal("show");
}


/*********** crontab actions ****************/
// TODO get rid of global variables
var schedule = "";
var job_command = "";

function deleteJob(_id){
	// TODO fix this. pass callback properly
	messageBox("<p> Do you want to delete this Job? </p>", "Confirm delete", null, null, function(){
		$.post(routes.remove, {_id: _id}, function(){
			location.reload();
		});
	});
}

function stopJob(_id){
	messageBox("<p> Do you want to stop this Job? </p>", "Confirm stop job", null, null, function(){
		$.post(routes.stop, {_id: _id}, function(){
			location.reload();
		});
	});
}

function startJob(_id){
	messageBox("<p> Do you want to start this Job? </p>", "Confirm start job", null, null, function(){
		$.post(routes.start, {_id: _id}, function(){
			location.reload();
		});
	});
}

function runJob(_id){
	messageBox("<p> Do you want to run this Job? </p>", "Confirm run job", null, null, function(){
		$.post(routes.run, {_id: _id}, function(){
			location.reload();
		});
		
	});
}

function setCrontab(){
	messageBox("<p> Do you want to set the crontab file? </p>", "Confirm crontab setup", null, null, function(){
		$.get(routes.crontab, { "env_vars": $("#env_vars").val() }, function(){
			// TODO show only if success
			infoMessageBox("Successfuly set crontab file!","Information");
			location.reload();
		}).fail(function(response) {
			errorMessageBox(response.statusText,"Error");
		});
	});
}

function getCrontab(){
	messageBox("<p> Do you want to get the crontab file? <br /> <b style='color:red'>NOTE: It is recommended to take a backup before this.</b> And refresh the page after this.</p>", "Confirm crontab retrieval", null, null, function(){
		$.get(routes.import_crontab, { "env_vars": $("#env_vars").val() }, function(){
			// TODO show only if success
			infoMessageBox("Successfuly got the crontab file!","Information");
			location.reload();
		});
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
		if(job.schedule.indexOf("@") !== 0){
			var components = job.schedule.split(" ");
			$("#job-minute").val(components[0]);
			$("#job-hour").val(components[1]);
			$("#job-day").val(components[2]);
			$("#job-month").val(components[3]);
			$("#job-week").val(components[4]);
		}
		if (job.mailing) {
			$("#job-mailing").attr("data-json", JSON.stringify(job.mailing));
		}
		schedule = job.schedule;
		job_command = job.command;
		if (job.logging && job.logging != "false")
			$("#job-logging").prop("checked", true);
		job_string();
	}

	$("#job-save").unbind("click"); // remove existing events attached to this
	$("#job-save").click(function(){
		// TODO good old boring validations
		if (!schedule) {
			schedule = "* * * * *";
		}
		let name = $("#job-name").val();
		let mailing = JSON.parse($("#job-mailing").attr("data-json"));
		let logging = $("#job-logging").prop("checked");
		$.post(routes.save, {name: name, command: job_command , schedule: schedule, _id: _id, logging: logging, mailing: mailing}, function(){
			location.reload();
		});
	});
}

function newJob(){
	schedule = "";
	job_command = "";
	$("#job-minute").val("*");
	$("#job-hour").val("*");
	$("#job-day").val("*");
	$("#job-month").val("*");
	$("#job-week").val("*");

	$("#job").modal("show");
	$("#job-name").val("");
	$("#job-command").val("");
	$("#job-mailing").attr("data-json", "{}");
	job_string();
	$("#job-save").unbind("click"); // remove existing events attached to this
	$("#job-save").click(function(){
		// TODO good old boring validations
		if (!schedule) {
			schedule = "* * * * *";
		}
		let name = $("#job-name").val();
		let mailing = JSON.parse($("#job-mailing").attr("data-json"));
		let logging = $("#job-logging").prop("checked");
		$.post(routes.save, {name: name, command: job_command , schedule: schedule, _id: -1, logging: logging, mailing: mailing}, function(){
			location.reload();
		});
	});
}

function doBackup(){
	messageBox("<p> Do you want to take backup? </p>", "Confirm backup", null, null, function(){
		$.get(routes.backup, {}, function(){
			location.reload();
		});
	});
}

function delete_backup(db_name){
	messageBox("<p> Do you want to delete this backup? </p>", "Confirm delete", null, null, function(){
		$.get(routes.delete_backup, {db: db_name}, function(){
			location = routes.root;
		});
	});
}

function restore_backup(db_name){
	messageBox("<p> Do you want to restore this backup? </p>", "Confirm restore", null, null, function(){
		$.get(routes.restore_backup, {db: db_name}, function(){
			location = routes.root;
		});
	});
}

function import_db(){
	messageBox("<p> Do you want to import crontab?<br /> <b style='color:red'>NOTE: It is recommended to take a backup before this.</b> </p>", "Confirm import from crontab", null, null, function(){
		$('#import_file').click();
	});
}

function setMailConfig(a){
	let data = JSON.parse(a.getAttribute("data-json"));
	let container = document.createElement("div");

	let message = "<p>This is based on nodemailer. Refer <a href='http://lifepluslinux.blogspot.com/2017/03/introducing-mailing-in-crontab-ui.html'>this</a> for more details.</p>";
	container.innerHTML += message;

	let transporterLabel = document.createElement("label");
	transporterLabel.innerHTML = "Transporter";
	let transporterInput = document.createElement("input");
	transporterInput.type = "text";
	transporterInput.id = "transporterInput";
	transporterInput.setAttribute("placeholder", config.transporterStr);
	transporterInput.className = "form-control";
	if (data.transporterStr){
		transporterInput.setAttribute("value", data.transporterStr);
	}
	container.appendChild(transporterLabel);
	container.appendChild(transporterInput);

	container.innerHTML += "<br/>";

	let mailOptionsLabel = document.createElement("label");
	mailOptionsLabel.innerHTML = "Mail Config";
	let mailOptionsInput = document.createElement("textarea");
	mailOptionsInput.setAttribute("placeholder", JSON.stringify(config.mailOptions, null, 2));
	mailOptionsInput.className = "form-control";
	mailOptionsInput.id = "mailOptionsInput";
	mailOptionsInput.setAttribute("rows", "10");
	if (data.mailOptions)
		mailOptionsInput.innerHTML = JSON.stringify(data.mailOptions, null, 2);
	container.appendChild(mailOptionsLabel);
	container.appendChild(mailOptionsInput);

	container.innerHTML += "<br/>";

	let button = document.createElement("a");
	button.className = "btn btn-primary btn-small";
	button.innerHTML = "Use Defaults";
	button.onclick = function(){
		document.getElementById("transporterInput").value = config.transporterStr;
		document.getElementById("mailOptionsInput").innerHTML = JSON.stringify(config.mailOptions, null, 2);
	};
	container.appendChild(button);

	let buttonClear = document.createElement("a");
	buttonClear.className = "btn btn-default btn-small";
	buttonClear.innerHTML = "Clear";
	buttonClear.onclick = function(){
		document.getElementById("transporterInput").value = "";
		document.getElementById("mailOptionsInput").innerHTML = "";
	};
	container.appendChild(buttonClear);

	messageBox(container, "Mailing", null, null, function(){
		let transporterStr = document.getElementById("transporterInput").value;
		let mailOptions;
		try{
			mailOptions = JSON.parse(document.getElementById("mailOptionsInput").value);
		} catch (err) {}

		if (transporterStr && mailOptions){
				a.setAttribute("data-json", JSON.stringify({transporterStr: transporterStr, mailOptions: mailOptions}));
		} else {
				a.setAttribute("data-json", JSON.stringify({}));
		}
	});
}

function setHookConfig(a){
	messageBox("<p>Coming Soon</p>", "Hooks", null, null, null);
}

// script corresponding to job popup management
function job_string(){
	$("#job-string").val(schedule + " " + job_command);
	return schedule + " " + job_command;
}

function set_schedule(){
	schedule = $("#job-minute").val() + " " +$("#job-hour").val() + " " +$("#job-day").val() + " " +$("#job-month").val() + " " +$("#job-week").val();
	job_string();
}
// popup management ends
