package cmd

import (
	"log"
	"net/http"

	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(serveCmd)
}

var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Starts server for kavach-server.",
	Run: func(cmd *cobra.Command, args []string) {
		model.SetupDB()

		r := action.RegisterRoutes()

		go func() {
			promRouter := chi.NewRouter()
			promRouter.Mount("/metrics", promhttp.Handler())
			log.Fatal(http.ListenAndServe(":8001", promRouter))
		}()

		err := http.ListenAndServe(":8000", r)
		if err != nil {
			log.Fatal(err)
		}
	},
}
