package api


import (
  "database/sql"
  "net/http"
  "log"
  "github.com/gorilla/mux"
  "github.com/skw1335/Go_backend/service/user"
)
type APIServer struct {

  addr string
  db *sql.DB

}

func NewAPIServer(addr string, db *sql.DB) *APIServer {
  return &APIServer{
    addr: addr,
    db: db,
  }
}

func (s *APIServer) Run() error {
  router := mux.NewRouter()
  subrouter := router.PathPrefix("api/v1").Subrouter()
 
  userStore := user.NewStore(s.db)
  userHandler := user.NewHandler(userStore)
  userHandler.RegisterRoutes(subrouter)
  log.Println("listening on", s)
 

  return http.ListenAndServe(s.addr, router)
}


