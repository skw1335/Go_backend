package main

import (
  "database/sql"
  "log"
  "github.com/go-sql-driver/mysql"
  "github.com/skw1335/Go_backend/cmd/api"
  "github.com/skw1335/Go_backend/db"
  "github.com/skw1335/Go_backend/configs"
)

func main() {
  db, err := db.NewMySQLStorage(mysql.Config {
    User:         configs.Envs.DBUser,
    Passwd:       configs.Envs.DBPassword,
    Addr:         configs.Envs.DBAddress,
    DBName:       configs.Envs.DBName, 
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

