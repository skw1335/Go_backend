build:
	@go build -o bin/Go_backend cmd/main.go

test:
	@go test -v ./...

run: build
	@./bin/Go_backend
