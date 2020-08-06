package util

import (
	"os"

	"github.com/sirupsen/logrus"
)

var Log *logrus.Logger

func InitLogging(file *os.File) {
	var log = logrus.New()
	log.SetFormatter(&logrus.JSONFormatter{})
	log.Level = logrus.TraceLevel
	log.SetOutput(file)
	Log = log
}
