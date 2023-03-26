const core = require('@actions/core');
const html_tagger = require("./src/html-tagger")


// most @actions toolkit packages have async methods
async function run() {
  try {

    const startPoint = core.getInput('start-point');
    core.info(`Starting point will be  ${startPoint}`);

    const score = html_tagger(startPoint)
    core.info(`Your score in HTML is \n ${score}`)

    core.setOutput("level_1", score["level_1"])
    core.setOutput("level_2", score["level_2"])
    core.setOutput("level_3", score["level_3"])

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
