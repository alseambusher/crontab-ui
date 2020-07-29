const BASE_URL = process.env.BASE_URL || '/';
exports.routes = {
	"root" : BASE_URL,
	"save" : BASE_URL+"save",
	"run" : BASE_URL+"runjob",
	"crontab" : BASE_URL+"crontab",
	"stop" : BASE_URL+"stop",
	"start" : BASE_URL+"start",
	"remove": BASE_URL+"remove",
	"backup": BASE_URL+"backup",
	"restore": BASE_URL+"restore",
	"delete_backup": BASE_URL+"delete",
	"restore_backup": BASE_URL+"restore_backup",
	"export": BASE_URL+"export",
	"import": BASE_URL+"import", // this is import from database
	"import_crontab": BASE_URL+"import_crontab", // this is from existing crontab
	"logger": BASE_URL+"logger",
	"stdout": BASE_URL+"stdout",
};



exports.relative = Object.keys(exports.routes).reduce((p, c) => ({...p, [c]: exports.routes[c].replace(/^\//, '')}), {});
exports.relative["root"] = ".";