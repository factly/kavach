package util

import (
	"context"
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi/middleware"
)

// GormRequestID returns middleware to add request_id in gorm context
func GormRequestID(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := middleware.GetReqID(r.Context())
		model.DB = model.DB.WithContext(context.WithValue(r.Context(), middleware.RequestIDKey, requestID))
		h.ServeHTTP(w, r)
	})
}
