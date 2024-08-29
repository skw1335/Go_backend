build:
	@go build -o bin/Go_backend 

run: build
	@./bin/Go_backend

test:
	@go test -v ./...
