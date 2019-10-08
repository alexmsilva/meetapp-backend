import * as Yup from 'yup';
import { isBefore, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';

class MeetupController {
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
            return res.status(400).json({ error: 'Past dates are not permitted' });
        }

        const meetup = await Meetup.create({ ...req.body, user_id: req.userId });

        return res.json(meetup);
    }
}

export default new MeetupController();
