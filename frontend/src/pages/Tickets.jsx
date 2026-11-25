import { Link } from 'react-router-dom';
import TicketBrowser from '../components/TicketBrowser';
import { Icon } from '../components/Icons';

export default function Tickets() {
  return (
    <TicketBrowser
      mode="user"
      title="My Tickets"
      subtitle="Search, filter, and track all support tickets you submitted"
      headerAction={
        <Link to="/tickets/new" className="btn btn-primary">
          <Icon name="plus" size={16} />
          New Ticket
        </Link>
      }
    />
  );
}
