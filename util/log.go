package util

import (
	"fmt"
	"net/http"
	"os"
	"path"
	"runtime"
	"strings"
	"time"

	"github.com/go-chi/chi/middleware"
	"github.com/sirupsen/logrus"
)

var log *logrus.Logger

var req *http.Request

// ErrorLogger middleware to log errors
func ErrorLogger(file *os.File) func(next http.Handler) http.Handler {
	log = logrus.New()
	log.SetFormatter(&logrus.TextFormatter{})
	log.Level = logrus.TraceLevel
	log.SetOutput(file)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			req = r
			next.ServeHTTP(w, r)
		})
	}
}

func LogError(err error) {
	logFields := logrus.Fields{}

	logFields["ts"] = time.Now().UTC().Format(time.RFC1123)

	if reqID := middleware.GetReqID(req.Context()); reqID != "" {
		logFields["req_id"] = reqID
	}

	scheme := "http"
	if req.TLS != nil {
		scheme = "https"
	}
	logFields["http_scheme"] = scheme
	logFields["http_proto"] = req.Proto
	logFields["http_method"] = req.Method

	logFields["remote_addr"] = req.RemoteAddr
	logFields["user_agent"] = req.UserAgent()

	logFields["uri"] = fmt.Sprintf("%s://%s%s", scheme, req.Host, req.RequestURI)

	if pc, file, line, ok := runtime.Caller(1); ok {
		funcName := runtime.FuncForPC(pc).Name()

		baseIdx := strings.Index(file, "kavach-server") + 13
		relPath := file[baseIdx:]

		logFields["source"] = fmt.Sprintf("%s:%s:%v", relPath, path.Base(funcName), line)
	}

	log.WithFields(logFields).Error(err)
}
