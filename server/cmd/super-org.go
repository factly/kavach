package cmd

import (
	setup "github.com/factly/kavach-server/util/setup"
	"github.com/factly/x/loggerx"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(superOrgCmd)
}

var superOrgCmd = &cobra.Command{
	Use:   "create-super-org",
	Short: "Creates super organisation for kavach-server which adds factly applications",
	Run: func(cmd *cobra.Command, args []string) {
		err := setup.CreateSuperOrg()
		if err != nil {
			loggerx.Error(err)
		}
	},
}
