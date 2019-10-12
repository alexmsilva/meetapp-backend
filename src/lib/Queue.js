import Bee from 'bee-queue';
import SubscriptionMail from '../app/jobs/SubscriptionMail';
import redisConfig from '../config/redis';

const jobs = [SubscriptionMail];

class Queue {
    constructor() {
        this.queues = {};
        this.init();
    }

    init() {
        jobs.forEach(({ key, handle }) => {
            this.queues[key] = {
                queue: new Bee(key, { redis: redisConfig }),
                handle
            };
        });
    }

    add(key, job) {
        return this.queues[key].queue.createJob(job).save();
    }

    processQueue() {
        jobs.forEach(job => {
            const { queue, handle } = this.queues[job.key];
            queue.on('failed', this.handleFailure).process(handle);
        });
    }

    handleFailure(job, error) {
        console.log(`Queue ${job.queue.name}: FAILED`, error);
    }
}

export default new Queue();
