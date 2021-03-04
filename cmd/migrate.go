package cmd

import (
	"github.com/factly/kavach-server/model"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(migrateCmd)
}

var migrateCmd = &cobra.Command{
	Use:   "migrate",
	Short: "Apply database migrations for kavach-server.",
	Run: func(cmd *cobra.Command, args []string) {
		// db setup
		model.SetupDB()

		// apply migrations
		model.Migration()
	},
}
