import * as Yup from 'yup';
import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
    async index(req, res) {
        const page = req.query.page || 1;
        const date = req.query.date ? parseISO(req.query.date) : new Date();
        const limit = 10;

        const meetups = await Meetup.findAll({
            where: {
                date: {
                    [Op.between]: [startOfDay(date), endOfDay(date)]
                }
            },
            order: ['date'],
            attributes: ['id', 'title', 'date', 'description', 'location'],
            limit,
            offset: (page - 1) * limit,
            include: [
                {
                    model: User,
                    as: 'organizer',
                    attributes: ['name', 'email']
                },
                {
                    model: File,
                    as: 'banner',
                    attributes: ['id', 'path', 'url']
                }
            ]
        });

        return res.json(meetups);
    }

    async create(req, res) {
        const schema = Yup.object().shape({
            title: Yup.string().required(),
            description: Yup.string().required(),
            date: Yup.date().required(),
            location: Yup.string().required(),
            file_id: Yup.number()
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        if (isBefore(parseISO(req.body.date), new Date())) {
            return res.status(400).json({ error: 'Invalid meetup date' });
        }

        const meetup = await Meetup.create({ ...req.body, user_id: req.userId });

        return res.json(meetup);
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            title: Yup.string(),
            description: Yup.string(),
            date: Yup.date(),
            location: Yup.string(),
            file_id: Yup.number()
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const meetup = await Meetup.findByPk(req.params.id);

        if (meetup.user_id !== req.userId) {
            return res.status(401).json({ error: 'Not authorized to update this meetup' });
        }

        if (isBefore(parseISO(req.body.date), new Date())) {
            return res.status(400).json({ error: 'Invalid meetup date' });
        }

        if (meetup.isPast) {
            return res.status(400).json({ error: 'Can not update past meetups' });
        }

        const { id, title, description, date, location } = await meetup.update(req.body);

        return res.json({
            id,
            title,
            description,
            date,
            location
        });
    }

    async delete(req, res) {
        const meetup = await Meetup.findByPk(req.params.id);

        if (meetup.user_id !== req.userId) {
            return res.status(401).json({ error: 'Not authorized to delete this meetup' });
        }

        if (meetup.isPast) {
            return res.status(400).json({ error: 'Can not delete past meetups' });
        }

        await meetup.destroy();

        return res.json();
    }
}

export default new MeetupController();
