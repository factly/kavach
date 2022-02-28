package cmd

import (
	"log"

	"github.com/factly/kavach-server/model"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(superUserCmd)
}

var superUserCmd = &cobra.Command{
	Use:   "create-super-user",
	Short: "Creates super user for kavach-server.",
	Run: func(cmd *cobra.Command, args []string) {
		log.Println("Creating super user")
		err := model.CreateSuperUser()
		if err != nil {
			log.Fatal(err)
		}
	},
}
