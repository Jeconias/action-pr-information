import * as core from "@actions/core";
import * as github from "@actions/github";

const actionName = "PR Information";

const handleDebug = (str: string) => {
  const isDebug = core.isDebug();
  if(!isDebug) return;

  core.debug(`[${actionName}]::${str}`)
}

async function run(): Promise<void> {

  
  console.log(github.context.payload.action);

  handleDebug(JSON.stringify(github.context.payload));

  
}

run().catch((err) => core.setFailed(err.message));