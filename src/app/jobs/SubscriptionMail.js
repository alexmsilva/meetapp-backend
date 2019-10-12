import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class SubscriptionMail {
    get key() {
        return 'SubscriptionMail';
    }

    async handle({ data }) {
        const { meetup, user } = data;

        await Mail.sendMail({
            to: `${meetup.organizer.name} <${meetup.organizer.email}>`,
            subject: 'Nova inscrição realizada!',
            template: 'subscription',
            context: {
                meetup,
                user,
                date: format(parseISO(meetup.date), "dd 'de' MMMM', às' H:mm'h'", { locale: pt })
            }
        });
    }
}

export default new SubscriptionMail();
