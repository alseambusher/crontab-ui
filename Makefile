VER=0.4.3
PLATFORMS=linux/amd64,linux/arm64

release:
	sed -i '' "s/version\": \".*/version\": \"$(VER)\",/" package.json
	npm publish
	docker buildx build --platform $(PLATFORMS) \
		-t alseambusher/crontab-ui:latest \
		-t alseambusher/crontab-ui:$(VER) \
		--push .
