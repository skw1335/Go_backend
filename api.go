package api

import (
  "net/http"
  "github.com/gorilla/mux"
)

func WriteJSON(w http.ResponseWriter, status int, v any) error {
  w.WriteHeader(status)
  w.Header().Set("Content-Type", "application/json")
  return json.NewEncoder(w).Encode(v)

}

type apiFunc func(http.ResponseWriter, *http.Request) error

type ApiErorr struct {
  Error string
}
func makeHTTPHandleFunc(f apiFunc) http.HandlerFunc {
  return func (w http.ResponseWriter, r *http.Request) {
    if err := f(w, r); err != nil {
      WriteJSON(w, http.StatusBadRequest, ApiError{Erorr: err.Error()}) 
      
    }
  }
}
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

  router.HandleFunc("/user", makeHTTPHandleFunc(s.handleUser))
  
  http.ListenAndServe(s.addr, router)
}

func (s *APIServer) handleUser(w http.ResponseWriter, r *http.Request) error {
  if r.Method == "GET" {
    return s.handleGetUser(w, r)
  }
  if r.Method == "POST" {
    return s.handleCreateUser(w, r)
  }
  if r.Method == "DELETE" {
    return s.handleDeleteUser(w, r) 
  }
  if r.Method == ""
  }
  }
  return nil
}

func (s *APIServer) handleCreateUser(w http.ResponseWriter, r *http.Request) error {
  return nil
}
func (s *APIServer) handleGetUser(w http.ResponseWriter, r *http.Request) error {
  return nil
}
func (s *APIServer) handleDeleteUser(w http.ResponseWriter, r *http.Request) error {
  return nil
}



