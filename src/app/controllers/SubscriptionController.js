import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';

class SubscriptionController {
    async index(req, res) {
        return res.json({ message: 'Working on...' });
    }

    async create(req, res) {
        const meetup = await Meetup.findByPk(req.params.id);

        if (meetup.isPast) {
            return res.status(400).json({ error: 'Can not subscribe for past meetups' });
        }

        if (req.userId === meetup.user_id) {
            return res.status(400).json({ error: 'Can not subscribe for your own meetups' });
        }

        /**
         * Checks the meetup is the same, or has the same date/time
         */
        const checkSubscription = await Subscription.findOne({
            where: {
                user_id: req.userId
            },
            include: [
                {
                    model: Meetup,
                    as: 'meetup',
                    where: {
                        date: meetup.date
                    }
                }
            ]
        });

        if (checkSubscription) {
            return res.status(400).json({ error: 'Can not subscribe with two meetups at same time' });
        }

        const subscription = await Subscription.create({
            user_id: req.userId,
            meetup_id: meetup.id
        });

        return res.json(subscription);
    }

    async delete(req, res) {
        return res.json({ message: 'Working on...' });
    }
}

export default new SubscriptionController();
