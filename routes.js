// base url
var base_url = (process.env.BASE_URL == undefined ? '' : process.env.BASE_URL);
base_url = base_url.replace(/\/+$/, "").trim();

exports.base_url = base_url;

var routes = {
	"root": "/",
	"save": "/save",
	"run": "/runjob",
	"crontab": "/crontab",
	"stop": "/stop",
	"start": "/start",
	"remove": "/remove",
	"backup": "/backup",
	"restore": "/restore",
	"delete_backup": "/delete",
	"restore_backup": "/restore_backup",
	"export": "/export",
	"import": "/import", // this is import from database
	"import_crontab": "/import_crontab", // this is from existing crontab
	"logger": "/logger",
	"stdout": "/stdout",
};

exports.routes = Object.keys(routes).reduce((p, c) => ({...p, [c]: base_url + routes[c]}), {});

exports.relative = Object.keys(routes).reduce((p, c) => ({...p, [c]: routes[c].replace(/^\//, '')}), {});
exports.relative["root"] = base_url;
