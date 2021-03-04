package cmd

import (
	"github.com/factly/kavach-server/config"
	"github.com/spf13/cobra"
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "kavach-server",
	Short: "Backend for kavach, a security application based on ory stack.",
	Long: `Kavach Server is lightweight server application for user and organisation 
	management. It uses ory stack for authentication and user management operations.`,
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	cobra.CheckErr(rootCmd.Execute())
}

func init() {
	cobra.OnInitialize(config.SetupVars)
}
