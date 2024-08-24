package main

import "github.com/skw1335/Go_backend/cmd/api"

func main() {
  server := api.NewAPIServer(":8080", nil)
  if err := server.Run(); err != nil {
    log.Fatal(err)
  }
} 
