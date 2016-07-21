/*********** MessageBox ****************/
// simply show info.  Only close button
function infoMessageBox(message, title){
	$("#info-body").html(message);
	$("#info-title").html(title);
	$("#info-popup").modal('show');
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

function setCrontab(){
	messageBox("<p> Do you want to set the crontab file? </p>", "Confirm crontab setup", null, null, function(){
		$.get(routes.crontab, { "env_vars": $("#env_vars").val() }, function(){
			// TODO show only if success
			infoMessageBox("Successfuly set crontab file!","Information");
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
		current_job = job;
		$("#job").modal("show");
		$("#job-name").val(job.name);
		$("#job-command").val(job.command);
		$("#job-command-template").val(job.command_template);
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
		if (job.logging && job.logging != "false")
			$("#job-logging").prop("checked", true);
		job_string();
		setTemplateVariables(job.command_template);
	} else {
		setTemplateVariables(null);
	}

	$("#job-save").unbind("click"); // remove existing events attached to this
	$("#job-save").click(function(){
		// TODO good old boring validations
		$.post(routes.save, {name: $("#job-name").val(), command: job_command , schedule: schedule, _id: _id, logging: $("#job-logging").prop("checked"), command_template: $('#job-command-template').val(), vars: current_job.vars }, function(){
			location.reload();
		})
	});
}

function findTemplate(templateId) {
	var template = null;

	templates.forEach(function(tmpl) {
		if(tmpl._id == templateId) {
			template = tmpl;
		}
	});

	return template;
}

function setTemplateVariables(templateId) {
	var template = findTemplate(templateId);

	$('#job-command-variables-wrapper').toggle(!!template);
	$('#job-command-wrapper').toggle(!template);

	if(template) {
		job_command = renderTemplateCommand(templateId);
		schedule = template.schedule;

		var $jobVariables = $('#job-variables-list').empty(),
				vars = current_job.vars || {};

		findCommandVariables(template.command).forEach(function(varName) {

			var $input = $('<input type="text" class="form-control job-variables" />').val(vars[varName]);

			$jobVariables.append('<label>'+varName+'</label>');
			$jobVariables.append($input);
			$jobVariables.append('<br />');

			$input.change(function() {
				current_job.vars = current_job.vars || {};
				current_job.vars[varName] = $(this).val();
			})
		})

	} else {
		job_command = $('#job-command').val();
	}

	job_string();
}

function findCommandVariables (command) {
	return command.match(/{[a-zA-Z]+}/g).map(function(cmd) {
		return cmd.substring(1, cmd.length - 1);
	});
};

function renderTemplateCommand(templateId) {
	var template = findTemplate(templateId);

	if(template) {
		return template.command;
	}

	return '';
}

function newJob(){
	current_job = {};
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
	$("#job-command-template").val("");
	job_string();
	$("#job-save").unbind("click"); // remove existing events attached to this
	$("#job-save").click(function(){
		// TODO good old boring validations
		$.post(routes.save, {name: $("#job-name").val(), command: job_command , schedule: schedule, _id: -1, logging: $("#job-logging").prop("checked"), command_template: $('#job-command-template').val(), vars: current_job.vars }, function(){
			location.reload();
		})
	});

	setTemplateVariables(null);
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


// script corresponding to job popup management
var schedule = "";
var job_command = "";
var current_job = null;
function job_string(){
	$("#job-string").val(schedule + " " + job_command);
	return schedule + " " + job_command;
}

function set_schedule(){
	schedule = $("#job-minute").val() + " " +$("#job-hour").val() + " " +$("#job-day").val() + " " +$("#job-month").val() + " " +$("#job-week").val();
	job_string();
}
// popup management ends


/**************** Template Action s***************/

function newTemplate(){
	schedule = ""
	template_command = ""
	$("#template-minute").val("*");
	$("#template-hour").val("*");
	$("#template-day").val("*");
	$("#template-month").val("*");
	$("#template-week").val("*");

	$("#template-popup").modal("show");
	$("#template-name").val("");
	$("#template-command").val("");
	template_string();
	$("#template-save").unbind("click"); // remove existing events attached to this
	$("#template-save").click(function(){
		// TODO good old boring validations
		$.post(routes.save_template, {name: $("#template-name").val(), command: template_command , schedule: schedule, _id: -1}, function(){
			location.reload();
		})
	});

	$('#template-remove').unbind('click').hide();
}

function editTemplate(_id){
	var template = findTemplate(_id);
	if(template){
		$("#template-popup").modal("show");
		$("#template-name").val(template.name);
		$("#template-command").val(template.command);

		// if macro not used
		if(template.schedule && template.schedule.indexOf("@") != 0){
			var components = template.schedule.split(" ");
			$("#template-minute").val(components[0]);
			$("#template-hour").val(components[1]);
			$("#template-day").val(components[2]);
			$("#template-month").val(components[3]);
			$("#template-week").val(components[4]);
		}
		schedule = template.schedule;
		template_command = template.command;

		template_string();
	}

	$("#template-save").unbind("click"); // remove existing events attached to this
	$("#template-save").click(function(){
		// TODO good old boring validations
		$.post(routes.save_template, {name: $("#template-name").val(), command: template_command , schedule: schedule, _id: _id}, function(){
			location.reload();
		})
	});

	$('#template-remove')
		.show()
		.unbind('click')
		.click(function() {
			if(window.confirm('Are you sure you want to delete this template?')) {
				$.post(routes.remove_template, {_id:_id}, function() {
					location.reload();
				});
			}
		});

}

function set_template_schedule(){
	schedule = $("#template-minute").val() + " " +$("#template-hour").val() + " " +$("#template-day").val() + " " +$("#template-month").val() + " " +$("#template-week").val();
	template_string();
}

function template_string(){
	$("#template-string").val(schedule + " " + template_command);
	return schedule + " " + template_command;
}
