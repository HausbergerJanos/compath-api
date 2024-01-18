const cron = require('node-cron');

class CronManager {
  constructor() {
    this.jobs = {};
  }

  createJob(jobId, schedule, taskFunction) {
    if (this.jobs[jobId]) {
      console.log(`A job with ID ${jobId} already exists.`);
      return;
    }

    this.jobs[jobId] = cron.schedule(schedule, async () => {
      console.log(`Executing job ID: ${jobId}`);
      try {
        const shouldStop = await taskFunction();
        if (shouldStop) {
          this.stopJob(jobId);
          console.log(
            `Job ID ${jobId} completed successfully and has been stopped.`,
          );
        }
      } catch (error) {
        this.stopJob(jobId);
        console.error(`Error occurred in job ID ${jobId}:`, error);
      }
    });

    console.log(`Cron job with ID ${jobId} has been created.`);
  }

  stopJob(jobId) {
    if (this.jobs[jobId]) {
      this.jobs[jobId].stop();
      delete this.jobs[jobId];
      console.log(`Cron job with ID ${jobId} has been stopped and removed.`);
    } else {
      console.log(`No job found with ID ${jobId}.`);
    }
  }
}

module.exports = new CronManager();
