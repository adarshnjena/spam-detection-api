import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '../src/schema';
import { users, contacts, callHistory, spamReports } from '../src/schema';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function clearAndResetData() {
  await db.execute(sql`
    TRUNCATE TABLE ${users}, ${contacts}, ${callHistory}, ${spamReports} RESTART IDENTITY CASCADE;
  `);
  console.log('All tables truncated and sequences reset');
}

async function generatePhoneNumber() {
  return `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
}

async function populateData() {
  try {
    await clearAndResetData();

    // Generate users
    const userCount = 50;
    const userInserts = [];
    for (let i = 0; i < userCount; i++) {
      userInserts.push({
        name: `User ${i + 1}`,
        password: await bcrypt.hash('password123', 10),
      });
    }
    const insertedUsers = await db.insert(users).values(userInserts).returning();
    console.log(`Inserted ${insertedUsers.length} users`);

    // Generate contacts
    const contactInserts = [];
    for (const user of insertedUsers) {
      contactInserts.push({
        userId: user.id,
        name: user.name,
        phoneNumber: await generatePhoneNumber(),
        email: `user${user.id}@example.com`,
      });
    }
    const insertedContacts = await db.insert(contacts).values(contactInserts).returning();
    console.log(`Inserted ${insertedContacts.length} contacts`);

    // Generate call history
    const callHistoryCount = 200;
    const callHistoryInserts = [];
    const usedPairs = new Set();
    
    while (callHistoryInserts.length < callHistoryCount) {
      const caller = insertedContacts[Math.floor(Math.random() * insertedContacts.length)];
      const receiver = insertedContacts[Math.floor(Math.random() * insertedContacts.length)];
      const pairKey = `${caller.id}-${receiver.id}`;
      
      if (caller.id !== receiver.id && !usedPairs.has(pairKey)) {
        callHistoryInserts.push({
          callerId: caller.id,
          receiverId: receiver.id,
          callTime: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        });
        usedPairs.add(pairKey);
      }
    }
    
    const insertedCallHistory = await db.insert(callHistory).values(callHistoryInserts).returning();
    console.log(`Inserted ${insertedCallHistory.length} call history entries`);

    // Generate spam reports
    const spamReportCount = 50;
    const spamReportInserts = [];
    const usedSpamPairs = new Set();

    while (spamReportInserts.length < spamReportCount) {
      const reporter = insertedUsers[Math.floor(Math.random() * insertedUsers.length)];
      const reportedContact = insertedContacts[Math.floor(Math.random() * insertedContacts.length)];
      const pairKey = `${reporter.id}-${reportedContact.phoneNumber}`;

      if (reporter.id !== reportedContact.userId && !usedSpamPairs.has(pairKey)) {
        spamReportInserts.push({
          reporterId: reporter.id,
          phoneNumber: reportedContact.phoneNumber,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        });
        usedSpamPairs.add(pairKey);
      }
    }

    const insertedSpamReports = await db.insert(spamReports).values(spamReportInserts).returning();
    console.log(`Inserted ${insertedSpamReports.length} spam reports`);

    console.log('Data population completed successfully');
  } catch (error) {
    console.error('Error populating data:', error);
  } finally {
    await pool.end();
  }
}

populateData();