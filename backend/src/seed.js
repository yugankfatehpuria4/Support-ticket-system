const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Comment = require('./models/Comment');
const ActivityLog = require('./models/ActivityLog');
const Notification = require('./models/Notification');

const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000);

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Ticket.deleteMany({}),
      Comment.deleteMany({}),
      ActivityLog.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    const [admin, secondAdmin, demoUser, maya, liam, elena, marcus] = await User.create([
      {
        name: 'Alex Morgan',
        email: 'admin@helpdesk.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'Priya Nair',
        email: 'priya.admin@helpdesk.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'Jordan Taylor',
        email: 'user@helpdesk.com',
        password: 'user123',
        role: 'user',
      },
      {
        name: 'Maya Patel',
        email: 'maya.patel@company.io',
        password: 'user123',
        role: 'user',
      },
      {
        name: 'Liam Chen',
        email: 'liam.chen@company.io',
        password: 'user123',
        role: 'user',
      },
      {
        name: 'Elena Rossi',
        email: 'elena.rossi@company.io',
        password: 'user123',
        role: 'user',
      },
      {
        name: 'Marcus Reed',
        email: 'marcus.reed@company.io',
        password: 'user123',
        role: 'user',
      },
    ]);

    const ticketSpecs = [
      // 14 tickets for primary demo user (user@helpdesk.com)
      {
        title: 'Unable to access account after password reset',
        description:
          'I completed the password reset flow via email twice, but signing in with the new password still returns an invalid credentials error on Chrome.',
        category: 'account',
        priority: 'urgent',
        status: 'resolved',
        owner: demoUser,
        assignee: admin,
        createdHoursAgo: 120,
        updatedHoursAgo: 6,
        comments: [
          {
            author: demoUser,
            body: 'I am unable to access my account after resetting my password.',
            hoursAgo: 119,
          },
          {
            author: admin,
            body: 'We are investigating the authentication token cache issue. Please try signing in again after a few minutes.',
            hoursAgo: 112,
          },
          {
            author: demoUser,
            body: 'Cleared browser cache and signed in—the issue has been resolved. Thank you!',
            hoursAgo: 6,
          },
        ],
      },
      {
        title: 'Duplicate charge on October Pro subscription invoice',
        description:
          'Billing statement #INV-2026-1042 shows two consecutive charges of $49.00 on October 14. Could you review and issue a refund for the duplicate transaction?',
        category: 'billing',
        priority: 'high',
        status: 'in_progress',
        owner: demoUser,
        assignee: admin,
        createdHoursAgo: 48,
        updatedHoursAgo: 4,
        comments: [
          {
            author: admin,
            body: 'Thanks for flagging this, Jordan. I verified the duplicate gateway authorization and escalated it to our billing processor.',
            hoursAgo: 20,
          },
          {
            author: demoUser,
            body: 'Appreciate the quick check! Please let me know once the reversal is initiated.',
            hoursAgo: 14,
          },
        ],
      },
      {
        title: 'CSV export truncates multi-line ticket descriptions',
        description:
          'When exporting filtered reports to CSV from the analytics screen, rows containing line breaks break into malformed columns in Excel.',
        category: 'bug',
        priority: 'medium',
        status: 'open',
        owner: demoUser,
        assignee: null,
        createdHoursAgo: 18,
        updatedHoursAgo: 18,
      },
      {
        title: 'VPN split-tunnel drops WebSocket connections every 15 minutes',
        description:
          'While connected to the US-East corporate gateway, dashboard live updates disconnect every 15 minutes with ERR_CONNECTION_RESET.',
        category: 'network',
        priority: 'high',
        status: 'in_progress',
        owner: demoUser,
        assignee: secondAdmin,
        createdHoursAgo: 72,
        updatedHoursAgo: 9,
        comments: [
          {
            author: secondAdmin,
            body: 'We reproduced the idle timeout on US-East gateway nodes. Testing an increased keepalive interval now.',
            hoursAgo: 30,
          },
        ],
      },
      {
        title: 'Request: Keyboard shortcuts for quick ticket triage',
        description:
          'Adding shortcuts like "J/K" to move between tickets and "C" to jump to the comment box would speed up daily queue reviews significantly.',
        category: 'feature',
        priority: 'low',
        status: 'open',
        owner: demoUser,
        assignee: null,
        createdHoursAgo: 210,
        updatedHoursAgo: 190,
      },
      {
        title: 'Two-factor authenticator QR code fails to scan on iOS',
        description:
          'During security setup, the QR image appears clipped on smaller mobile viewports and the manual setup key is cut off.',
        category: 'account',
        priority: 'high',
        status: 'resolved',
        owner: demoUser,
        assignee: admin,
        createdHoursAgo: 310,
        updatedHoursAgo: 240,
        comments: [
          {
            author: admin,
            body: 'We deployed a responsive container fix for the 2FA modal and added a one-click copy button for the secret key.',
            hoursAgo: 241,
          },
        ],
      },
      {
        title: 'Clarification on annual seat proration policy',
        description:
          'We plan to add 5 new support agents mid-cycle next month. Will those seats be billed pro-rata until our March renewal date?',
        category: 'general',
        priority: 'low',
        status: 'closed',
        owner: demoUser,
        assignee: admin,
        createdHoursAgo: 420,
        updatedHoursAgo: 380,
        comments: [
          {
            author: admin,
            body: 'Yes! Additional seats added mid-cycle are automatically prorated to the exact day remaining in your billing period.',
            hoursAgo: 400,
          },
          {
            author: demoUser,
            body: 'Perfect, that answers everything. Closing this out.',
            hoursAgo: 385,
          },
        ],
      },
      {
        title: 'Webhook delivery retries returning 422 on custom headers',
        description:
          'After adding X-Tenant-Region to our outbound webhook configuration, deliveries fail with status 422 in the event log.',
        category: 'technical',
        priority: 'high',
        status: 'open',
        owner: demoUser,
        assignee: secondAdmin,
        createdHoursAgo: 10,
        updatedHoursAgo: 8,
      },
      {
        title: 'SSO SAML assertion fails for users with hyphenated domains',
        description:
          'Team members logging in with @north-bridge.co emails get redirected back to the login screen without an error banner.',
        category: 'technical',
        priority: 'urgent',
        status: 'in_progress',
        owner: demoUser,
        assignee: admin,
        createdHoursAgo: 26,
        updatedHoursAgo: 2,
        comments: [
          {
            author: admin,
            body: 'Identified a strict domain regex in the SAMLACS callback handler. Patch is queued for today’s release window.',
            hoursAgo: 3,
          },
        ],
      },
      {
        title: 'Dark theme contrast on priority badges',
        description:
          'Could we slightly increase contrast on the Low priority badge text so it stays readable on calibrated external monitors?',
        category: 'feature',
        priority: 'low',
        status: 'resolved',
        owner: demoUser,
        assignee: secondAdmin,
        createdHoursAgo: 500,
        updatedHoursAgo: 450,
      },
      {
        title: 'API rate limit headers missing on 429 responses',
        description:
          'Our sync worker respects Retry-After and X-RateLimit-Reset, but 429 responses from /api/tickets currently omit those headers.',
        category: 'bug',
        priority: 'medium',
        status: 'open',
        owner: demoUser,
        assignee: null,
        createdHoursAgo: 64,
        updatedHoursAgo: 64,
      },
      {
        title: 'Need updated W-9 and tax compliance certificate',
        description:
          'Our finance team requires an updated 2026 W-9 form for vendor onboarding before releasing our Q4 PO.',
        category: 'billing',
        priority: 'medium',
        status: 'closed',
        owner: demoUser,
        assignee: admin,
        createdHoursAgo: 620,
        updatedHoursAgo: 580,
        comments: [
          {
            author: admin,
            body: 'Attached the signed 2026 compliance packet to your billing contact email.',
            hoursAgo: 590,
          },
        ],
      },
      {
        title: 'High latency when uploading attachments over 4MB',
        description:
          'Uploading log archives from the Tokyo office takes over 45 seconds before timing out at the reverse proxy.',
        category: 'network',
        priority: 'medium',
        status: 'open',
        owner: demoUser,
        assignee: null,
        createdHoursAgo: 36,
        updatedHoursAgo: 36,
      },
      {
        title: 'How to archive inactive workspace members without losing history',
        description:
          'Two contractors finished their engagement. If we deactivate their accounts, will their past ticket comments remain attributed?',
        category: 'general',
        priority: 'low',
        status: 'resolved',
        owner: demoUser,
        assignee: admin,
        createdHoursAgo: 260,
        updatedHoursAgo: 215,
        comments: [
          {
            author: admin,
            body: 'Yes, deactivating preserves all historical comments and audit log attribution while revoking active sessions.',
            hoursAgo: 220,
          },
        ],
      },

      // 26 tickets across Maya, Liam, Elena, Marcus (total = 40 tickets)
      {
        title: 'Production OAuth callback throwing 502 Bad Gateway',
        description:
          'Customers authenticating via Google OAuth intermittently hit a 502 error page on eu-central-1 ingress.',
        category: 'network',
        priority: 'urgent',
        status: 'open',
        owner: maya,
        assignee: secondAdmin,
        createdHoursAgo: 5,
        updatedHoursAgo: 3,
        comments: [
          {
            author: secondAdmin,
            body: 'We see elevated upstream connection resets on eu-central-1b and are shifting traffic while inspecting TLS handshakes.',
            hoursAgo: 3,
          },
        ],
      },
      {
        title: 'Pagination resets filters when switching from page 2 to detail view',
        description:
          'Opening a ticket from page 2 and pressing browser Back returns to page 1 with cleared status filters.',
        category: 'bug',
        priority: 'medium',
        status: 'in_progress',
        owner: maya,
        assignee: admin,
        createdHoursAgo: 95,
        updatedHoursAgo: 40,
      },
      {
        title: 'Update primary billing contact to accounts-payable@company.io',
        description:
          'Please route future monthly PDF receipts to our AP inbox instead of my personal work email.',
        category: 'billing',
        priority: 'low',
        status: 'resolved',
        owner: maya,
        assignee: admin,
        createdHoursAgo: 340,
        updatedHoursAgo: 300,
      },
      {
        title: 'Support for custom SLA escalation rules per category',
        description:
          'We would like Urgent network incidents to escalate automatically after 30 minutes without an agent reply.',
        category: 'feature',
        priority: 'medium',
        status: 'open',
        owner: maya,
        assignee: null,
        createdHoursAgo: 180,
        updatedHoursAgo: 180,
      },
      {
        title: 'Account locked after 5 failed API key rotations',
        description:
          'Our CI script retried an expired token and triggered an automated security lockout for our integration user.',
        category: 'account',
        priority: 'urgent',
        status: 'resolved',
        owner: maya,
        assignee: admin,
        createdHoursAgo: 140,
        updatedHoursAgo: 125,
        comments: [
          {
            author: admin,
            body: 'Lockout cleared and token rotation rate threshold adjusted for verified service accounts.',
            hoursAgo: 126,
          },
        ],
      },
      {
        title: 'Docker container healthcheck fails behind corporate proxy',
        description:
          'Internal readiness probe to /api/health fails when HTTPS_PROXY is injected into the runtime environment.',
        category: 'technical',
        priority: 'high',
        status: 'open',
        owner: maya,
        assignee: secondAdmin,
        createdHoursAgo: 44,
        updatedHoursAgo: 44,
      },
      {
        title: 'Mobile Safari sticky header overlaps search input on scroll',
        description:
          'On iPhone 15 Safari, focusing the search bar scrolls slightly under the fixed top navigation bar.',
        category: 'bug',
        priority: 'medium',
        status: 'closed',
        owner: maya,
        assignee: secondAdmin,
        createdHoursAgo: 480,
        updatedHoursAgo: 440,
      },
      {
        title: 'DNS propagation delay for custom helpdesk portal subdomain',
        description:
          'We added the CNAME record for support.company.io 12 hours ago, but TLS certificate provisioning is still pending.',
        category: 'network',
        priority: 'high',
        status: 'in_progress',
        owner: liam,
        assignee: secondAdmin,
        createdHoursAgo: 22,
        updatedHoursAgo: 7,
        comments: [
          {
            author: secondAdmin,
            body: 'CAA record at your apex domain is blocking Let’s Encrypt issuance. Please add letsencrypt.org to CAA.',
            hoursAgo: 8,
          },
          {
            author: liam,
            body: 'Updated our Cloudflare DNS CAA record just now—can you re-trigger verification?',
            hoursAgo: 7,
          },
        ],
      },
      {
        title: 'Role permissions audit log export for SOC 2 compliance',
        description:
          'Our auditors asked for a 90-day export of admin role assignments and ticket status transitions.',
        category: 'general',
        priority: 'high',
        status: 'resolved',
        owner: liam,
        assignee: admin,
        createdHoursAgo: 280,
        updatedHoursAgo: 200,
      },
      {
        title: 'Memory spike during bulk comment import script',
        description:
          'Importing 2,000 legacy ticket notes via the REST API increases worker heap usage past 1.5 GB.',
        category: 'technical',
        priority: 'high',
        status: 'in_progress',
        owner: liam,
        assignee: secondAdmin,
        createdHoursAgo: 58,
        updatedHoursAgo: 16,
      },
      {
        title: 'Notification bell count stays at 1 after opening deep link',
        description:
          'Clicking a ticket URL from an email notification does not automatically mark the corresponding in-app alert as read.',
        category: 'bug',
        priority: 'low',
        status: 'open',
        owner: liam,
        assignee: null,
        createdHoursAgo: 130,
        updatedHoursAgo: 130,
      },
      {
        title: 'Downgrade plan from Enterprise to Growth before renewal',
        description:
          'We are consolidating two regional teams and would like to move to the Growth tier starting next billing cycle.',
        category: 'billing',
        priority: 'medium',
        status: 'open',
        owner: liam,
        assignee: admin,
        createdHoursAgo: 29,
        updatedHoursAgo: 29,
      },
      {
        title: 'Bulk status update action on Admin Tickets view',
        description:
          'Allow selecting multiple duplicate bug reports via checkboxes and closing them in one batch action.',
        category: 'feature',
        priority: 'low',
        status: 'open',
        owner: liam,
        assignee: null,
        createdHoursAgo: 350,
        updatedHoursAgo: 350,
      },
      {
        title: 'Cannot change display name with accented characters',
        description:
          'Saving profile name "Sébastien Müller" appears to succeed, but reloads with stripped diacritics.',
        category: 'account',
        priority: 'low',
        status: 'closed',
        owner: liam,
        assignee: admin,
        createdHoursAgo: 540,
        updatedHoursAgo: 510,
      },
      {
        title: 'PostgreSQL vs MongoDB connector inquiry for BI sync',
        description:
          'Does your reporting connector expose a read-only MongoDB aggregation endpoint for Metabase?',
        category: 'general',
        priority: 'low',
        status: 'resolved',
        owner: elena,
        assignee: admin,
        createdHoursAgo: 390,
        updatedHoursAgo: 360,
      },
      {
        title: 'Email notifications delayed by 25+ minutes during peak hours',
        description:
          'Ticket creation alerts sent between 09:00 and 11:00 EST arrive nearly half an hour late.',
        category: 'technical',
        priority: 'urgent',
        status: 'open',
        owner: elena,
        assignee: admin,
        createdHoursAgo: 7,
        updatedHoursAgo: 5,
      },
      {
        title: 'Rich markdown code blocks collapse indentation in comments',
        description:
          'Pasting JSON payloads into ticket comments strips leading spaces, making stack traces hard to read.',
        category: 'bug',
        priority: 'medium',
        status: 'resolved',
        owner: elena,
        assignee: secondAdmin,
        createdHoursAgo: 230,
        updatedHoursAgo: 170,
      },
      {
        title: 'VAT number not appearing on generated PDF invoices',
        description:
          'We entered our Italian VAT ID in billing settings last week, but the October invoice still omits it.',
        category: 'billing',
        priority: 'high',
        status: 'in_progress',
        owner: elena,
        assignee: admin,
        createdHoursAgo: 42,
        updatedHoursAgo: 12,
        comments: [
          {
            author: admin,
            body: 'Updated your billing profile tax metadata and regenerating the October PDF now.',
            hoursAgo: 12,
          },
        ],
      },
      {
        title: 'Packet loss between Frankfurt edge POP and database cluster',
        description:
          'Synthetic monitoring recorded 3.2% packet loss on Frankfurt routes between 02:00 and 02:40 UTC.',
        category: 'network',
        priority: 'high',
        status: 'closed',
        owner: elena,
        assignee: secondAdmin,
        createdHoursAgo: 460,
        updatedHoursAgo: 410,
      },
      {
        title: 'Slack integration channel picker shows archived channels',
        description:
          'When configuring alert routing, archived Slack channels clutter the dropdown list.',
        category: 'feature',
        priority: 'low',
        status: 'open',
        owner: elena,
        assignee: null,
        createdHoursAgo: 165,
        updatedHoursAgo: 165,
      },
      {
        title: 'Session timeout happens before 7-day JWT expiration',
        description:
          'Users report being signed out every 2 hours even when active on the ticket detail page.',
        category: 'account',
        priority: 'high',
        status: 'in_progress',
        owner: marcus,
        assignee: admin,
        createdHoursAgo: 32,
        updatedHoursAgo: 11,
      },
      {
        title: 'Search by short ticket ID returns zero results',
        description:
          'Typing the last 6 characters of a ticket ID into the search box does not match the ticket.',
        category: 'bug',
        priority: 'medium',
        status: 'resolved',
        owner: marcus,
        assignee: secondAdmin,
        createdHoursAgo: 150,
        updatedHoursAgo: 90,
        comments: [
          {
            author: secondAdmin,
            body: 'We updated the search query to support partial ID matching alongside title and description.',
            hoursAgo: 91,
          },
        ],
      },
      {
        title: 'Onboarding walkthrough request for 20 new support reps',
        description:
          'Could we schedule a 45-minute live training session next Tuesday for our newly hired customer ops cohort?',
        category: 'general',
        priority: 'medium',
        status: 'open',
        owner: marcus,
        assignee: admin,
        createdHoursAgo: 15,
        updatedHoursAgo: 15,
      },
      {
        title: 'IPv6 egress connectivity failing for outbound webhook endpoints',
        description:
          'Webhook targets with AAAA records fail to connect from worker nodes.',
        category: 'network',
        priority: 'medium',
        status: 'open',
        owner: marcus,
        assignee: null,
        createdHoursAgo: 88,
        updatedHoursAgo: 88,
      },
      {
        title: 'Sandbox environment data reset schedule',
        description:
          'How often is our staging sandbox refreshed, and can we trigger a manual snapshot restore?',
        category: 'technical',
        priority: 'low',
        status: 'closed',
        owner: marcus,
        assignee: secondAdmin,
        createdHoursAgo: 600,
        updatedHoursAgo: 560,
      },
      {
        title: 'Credit note application for annual contract upgrade',
        description:
          'We upgraded mid-year and need our remaining monthly credit applied to invoice #INV-2026-0981.',
        category: 'billing',
        priority: 'medium',
        status: 'resolved',
        owner: marcus,
        assignee: admin,
        createdHoursAgo: 290,
        updatedHoursAgo: 250,
      },
    ];

    const ticketDocs = ticketSpecs.map((spec) => ({
      _id: new mongoose.Types.ObjectId(),
      title: spec.title,
      description: spec.description,
      category: spec.category,
      priority: spec.priority,
      status: spec.status,
      createdBy: spec.owner._id,
      assignedTo: spec.assignee ? spec.assignee._id : null,
      createdAt: hoursAgo(spec.createdHoursAgo),
      updatedAt: hoursAgo(spec.updatedHoursAgo),
    }));

    // Use raw collection insertMany so custom historical createdAt/updatedAt are preserved accurately
    await Ticket.collection.insertMany(ticketDocs);

    const commentDocs = [];
    const activityDocs = [];
    const notificationDocs = [];

    ticketSpecs.forEach((spec, idx) => {
      const ticket = ticketDocs[idx];

      activityDocs.push({
        eventType: 'TICKET_CREATED',
        ticket: ticket._id,
        actor: spec.owner._id,
        message: `Ticket "${ticket.title}" was created`,
        metadata: { priority: ticket.priority, category: ticket.category },
        createdAt: ticket.createdAt,
        updatedAt: ticket.createdAt,
      });

      if (spec.status === 'in_progress') {
        const changeDate = hoursAgo(Math.max(1, spec.updatedHoursAgo + 1));
        activityDocs.push({
          eventType: 'STATUS_CHANGED',
          ticket: ticket._id,
          actor: (spec.assignee || admin)._id,
          message: `Ticket "${ticket.title}" status changed from open to in_progress`,
          metadata: { previousStatus: 'open', newStatus: 'in_progress' },
          createdAt: changeDate,
          updatedAt: changeDate,
        });
      }

      if (spec.status === 'resolved' || spec.status === 'closed') {
        const resolveDate = hoursAgo(Math.max(1, spec.updatedHoursAgo + 1));
        activityDocs.push({
          eventType: 'TICKET_RESOLVED',
          ticket: ticket._id,
          actor: (spec.assignee || admin)._id,
          message: `Ticket "${ticket.title}" was marked as resolved`,
          metadata: {},
          createdAt: resolveDate,
          updatedAt: resolveDate,
        });
      }

      if (spec.comments) {
        spec.comments.forEach((c) => {
          const commentId = new mongoose.Types.ObjectId();
          const cDate = hoursAgo(c.hoursAgo);
          commentDocs.push({
            _id: commentId,
            ticket: ticket._id,
            author: c.author._id,
            body: c.body,
            createdAt: cDate,
            updatedAt: cDate,
          });
          activityDocs.push({
            eventType: 'COMMENT_ADDED',
            ticket: ticket._id,
            actor: c.author._id,
            message: `${c.author.name} commented on ticket "${ticket.title}"`,
            metadata: { commentId },
            createdAt: cDate,
            updatedAt: cDate,
          });
        });
      }
    });

    // Seed realistic notifications for Demo User (unread + read) and Admin
    notificationDocs.push(
      {
        user: demoUser._id,
        ticket: ticketDocs[1]._id,
        message: `Alex Morgan commented on ticket "${ticketDocs[1].title}"`,
        eventType: 'COMMENT_ADDED',
        read: false,
        createdAt: hoursAgo(20),
        updatedAt: hoursAgo(20),
      },
      {
        user: demoUser._id,
        ticket: ticketDocs[8]._id,
        message: `Alex Morgan commented on ticket "${ticketDocs[8].title}"`,
        eventType: 'COMMENT_ADDED',
        read: false,
        createdAt: hoursAgo(3),
        updatedAt: hoursAgo(3),
      },
      {
        user: demoUser._id,
        ticket: ticketDocs[3]._id,
        message: `Ticket "${ticketDocs[3].title}" status changed from open to in_progress`,
        eventType: 'STATUS_CHANGED',
        read: false,
        createdAt: hoursAgo(9),
        updatedAt: hoursAgo(9),
      },
      {
        user: demoUser._id,
        ticket: ticketDocs[0]._id,
        message: `Ticket "${ticketDocs[0].title}" was marked as resolved`,
        eventType: 'TICKET_RESOLVED',
        read: true,
        createdAt: hoursAgo(6),
        updatedAt: hoursAgo(6),
      },
      {
        user: demoUser._id,
        ticket: ticketDocs[5]._id,
        message: `Ticket "${ticketDocs[5].title}" was marked as resolved`,
        eventType: 'TICKET_RESOLVED',
        read: true,
        createdAt: hoursAgo(240),
        updatedAt: hoursAgo(240),
      },
      // Admin notifications
      {
        user: admin._id,
        ticket: ticketDocs[14]._id,
        message: `Ticket "${ticketDocs[14].title}" was created`,
        eventType: 'TICKET_CREATED',
        read: false,
        createdAt: hoursAgo(5),
        updatedAt: hoursAgo(5),
      },
      {
        user: admin._id,
        ticket: ticketDocs[29]._id,
        message: `Ticket "${ticketDocs[29].title}" was created`,
        eventType: 'TICKET_CREATED',
        read: false,
        createdAt: hoursAgo(7),
        updatedAt: hoursAgo(7),
      },
      {
        user: admin._id,
        ticket: ticketDocs[7]._id,
        message: `Ticket "${ticketDocs[7].title}" was created`,
        eventType: 'TICKET_CREATED',
        read: false,
        createdAt: hoursAgo(10),
        updatedAt: hoursAgo(10),
      },
      {
        user: admin._id,
        ticket: ticketDocs[21]._id,
        message: `Liam Chen commented on ticket "${ticketDocs[21].title}"`,
        eventType: 'COMMENT_ADDED',
        read: true,
        createdAt: hoursAgo(7),
        updatedAt: hoursAgo(7),
      }
    );

    if (commentDocs.length) await Comment.collection.insertMany(commentDocs);
    if (activityDocs.length) await ActivityLog.collection.insertMany(activityDocs);
    if (notificationDocs.length) await Notification.collection.insertMany(notificationDocs);

    console.log(`Seed completed successfully:`);
    console.log(`- Users: 7 (2 admins, 5 users)`);
    console.log(`- Tickets: ${ticketDocs.length}`);
    console.log(`- Comments: ${commentDocs.length}`);
    console.log(`- Activity logs: ${activityDocs.length}`);
    console.log(`- Notifications: ${notificationDocs.length}`);
    console.log('Admin: admin@helpdesk.com / admin123');
    console.log('User:  user@helpdesk.com / user123');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
