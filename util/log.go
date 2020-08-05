package util

import "github.com/sirupsen/logrus"

var Log *logrus.Logger

func InitLogging() {
	var log = new(logrus.Logger)
	log.Formatter = new(logrus.JSONFormatter)
	log.Level = logrus.TraceLevel

	Log = log
}
