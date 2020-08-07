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

func InitLogging(file *os.File) {
	log = logrus.New()
	log.SetFormatter(&logrus.TextFormatter{})
	log.Level = logrus.TraceLevel
	log.SetOutput(file)
}

func LogError(r *http.Request, err error) {
	logFields := logrus.Fields{}

	logFields["ts"] = time.Now().UTC().Format(time.RFC1123)

	if reqID := middleware.GetReqID(r.Context()); reqID != "" {
		logFields["req_id"] = reqID
	}

	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	logFields["http_scheme"] = scheme
	logFields["http_proto"] = r.Proto
	logFields["http_method"] = r.Method

	logFields["remote_addr"] = r.RemoteAddr
	logFields["user_agent"] = r.UserAgent()

	logFields["uri"] = fmt.Sprintf("%s://%s%s", scheme, r.Host, r.RequestURI)

	if pc, file, line, ok := runtime.Caller(1); ok {
		funcName := runtime.FuncForPC(pc).Name()

		baseIdx := strings.Index(file, "kavach-server") + 13
		relPath := file[baseIdx:]

		logFields["source"] = fmt.Sprintf("%s:%s:%v", relPath, path.Base(funcName), line)
	}

	log.WithFields(logFields).Error(err)
}
