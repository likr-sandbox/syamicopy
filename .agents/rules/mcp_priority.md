# Rule: Prefer MCP Tools Over Local CLI Installation

When interacting with external platforms (such as Netlify, GitHub, BigQuery, etc.):

1. **Check Available MCP Servers First**: Identify if there is a running/registered MCP server matching the platform.
2. **Prioritize MCP Tools**: Always use the MCP server's provided tools (e.g., `netlify-deploy-services-updater` for deployments) for all reading and writing actions.
3. **Avoid Local Installations**: Do NOT attempt to install local CLI tools (e.g., `npm i -g netlify-cli`) or perform complex raw API auth curl commands unless the required action is completely unsupported by the MCP server's schema.
4. **Clean up**: If a local tool was temporarily installed to verify or set up something, ensure it is uninstalled or cleaned up before declaring the task complete.
