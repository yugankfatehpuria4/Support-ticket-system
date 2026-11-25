import TicketBrowser from '../components/TicketBrowser';

export default function AdminTickets() {
  return (
    <TicketBrowser
      mode="admin"
      title="All Support Tickets"
      subtitle="Review, filter, prioritize, and resolve customer requests"
    />
  );
}
