import { Op } from 'sequelize';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import File from '../models/File';
import User from '../models/User';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
    async index(req, res) {
        const subscriptions = await Subscription.findAll({
            where: {
                user_id: req.userId
            },
            attributes: ['id'],
            include: [
                {
                    model: Meetup,
                    as: 'meetup',
                    where: {
                        date: {
                            [Op.gt]: new Date()
                        }
                    },
                    attributes: ['title', 'date', 'description', 'location'],
                    include: [
                        {
                            model: File,
                            as: 'banner',
                            attributes: ['path', 'url']
                        },
                        {
                            model: User,
                            as: 'organizer',
                            attributes: ['name', 'email']
                        }
                    ]
                }
            ],
            order: [['meetup', 'date']]
        });

        return res.json(subscriptions);
    }

    async create(req, res) {
        const user = await User.findByPk(req.userId);
        const meetup = await Meetup.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'organizer',
                    attributes: ['name', 'email']
                }
            ]
        });

        if (meetup.isPast) {
            return res.status(400).json({ error: 'Can not subscribe for past meetups' });
        }

        if (user.id === meetup.user_id) {
            return res.status(400).json({ error: 'Can not subscribe for your own meetups' });
        }

        /**
         * Checks the meetup is the same, or has the same date/time
         */
        const checkSubscription = await Subscription.findOne({
            where: {
                user_id: user.id
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

        const subscription = await Subscription.create({ user_id: user.id, meetup_id: meetup.id });

        await Queue.add(SubscriptionMail.key, { meetup, user });

        return res.json(subscription);
    }

    async delete(req, res) {
        return res.json({ message: 'Working on...' });
    }
}

export default new SubscriptionController();
