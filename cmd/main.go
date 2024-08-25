package main

import (
  "log"
  "github.com/go-sql-driver/mysql"
  "github.com/skw1335/Go_backend/cmd/api"
  "github.com/skw1335/Go_backend/db"
  "github.com/skw1335/Go_backend/configs/env"
)

func main() {
  db, err := db.NewMySQLStorage(mysql.Config {
    User:         config.Envs.DBUser,
    Password:     config.Envs.DBPassword,
    Addr:         config.Envs.DBAddress,
    DBName:       config.Envs.DBName, 
    Net:          "tcp",
    AllowNativePasswords: true,
    ParseTime: true,
  })

  if err != nil {
    log.Fatal(err)
  }

  initStorage(db)

  server := api.NewAPIServer(":8080", nil)
  if err := server.Run(); err != nil {
    log.Fatal(err)
  }
}

func initStorage(db *sql.DB) {
  err := db.Ping()
  if err != nil {
    log.Fatal(err)
  }

  log.Println("DB: Successfully connected!")
}

