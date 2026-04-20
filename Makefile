VER=0.4.2

release:
	sed -i '' "s/version\": \".*/version\": \"$(VER)\",/" package.json
	npm publish
	docker build -t alseambusher/crontab-ui .
	docker tag alseambusher/crontab-ui alseambusher/crontab-ui:$(VER)
	docker push alseambusher/crontab-ui:latest
	docker push alseambusher/crontab-ui:$(VER)
