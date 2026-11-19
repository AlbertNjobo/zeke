import { eveChannel } from "eve/channels/eve";
import { localDev, none, vercelOidc } from "eve/channels/auth";

export default eveChannel({
  auth: [
    // Lets the eve TUI and Vercel deployments reach the deployed agent with OIDC.
    vercelOidc(),
    // Open on localhost for `eve dev` and the REPL; ignored in production.
    localDev(),
    // Public demo: the buyer portal calls the agent directly from the browser.
    // Replace with a real auth provider before handling non-public data.
    none(),
  ],
});
