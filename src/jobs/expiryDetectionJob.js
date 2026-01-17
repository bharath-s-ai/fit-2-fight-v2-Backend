const cron = require('node-cron');
const Member = require('../models/Member');
const MessageDraft = require('../models/MessageDraft');
const messageService = require('../services/messageService');
const moment = require('moment');

// Run daily at 9:00 AM
const startExpiryDetectionJob = () => {
  // Schedule: minute hour day month day-of-week
  // '0 9 * * *' = Every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('\n=================================');
    console.log('🔔 Running expiry detection job...');
    console.log(`📅 Time: ${new Date().toLocaleString()}`);
    console.log('=================================\n');
    
    try {
      // Find members expiring in next 7 days who haven't been notified
      const expiringStart = moment().startOf('day').toDate();
      const expiringEnd = moment().add(7, 'days').endOf('day').toDate();
      
      const expiringMembers = await Member.find({
        expiryDate: { $gte: expiringStart, $lte: expiringEnd },
        status: 'active',
        isExpiryNotified: false
      }).populate('branchId', 'name code');
      
      console.log(`📊 Found ${expiringMembers.length} members expiring soon`);
      
      let draftsCreated = 0;
      let draftsSkipped = 0;
      
      // Create draft messages
      for (const member of expiringMembers) {
        // Check if draft already exists
        const existingDraft = await MessageDraft.findOne({
          memberId: member._id,
          type: 'expiry',
          status: 'draft'
        });
        
        if (existingDraft) {
          draftsSkipped++;
          continue;
        }
        
        const message = messageService.generateMessage('expiry', member);
        
        await MessageDraft.create({
          memberId: member._id,
          phone: member.phone,
          type: 'expiry',
          message,
          status: 'draft',
          branchId: member.branchId._id,
          createdBy: null // System generated
        });
        
        draftsCreated++;
        console.log(`✅ Draft created for: ${member.memberId} - ${member.name} (Expires: ${moment(member.expiryDate).format('DD MMM YYYY')})`);
      }
      
      console.log(`\n📝 Drafts created: ${draftsCreated}`);
      console.log(`⏭️  Drafts skipped (already exist): ${draftsSkipped}`);
      
      // Update expired members status
      const now = new Date();
      const expiredResult = await Member.updateMany(
        { 
          expiryDate: { $lt: now },
          status: 'active'
        },
        { 
          status: 'expired'
        }
      );
      
      console.log(`🔴 Updated ${expiredResult.modifiedCount} expired membership(s) to 'expired' status`);
      
      console.log('\n=================================');
      console.log('✅ Expiry detection job completed');
      console.log('=================================\n');
      
    } catch (error) {
      console.error('\n❌ Expiry detection job error:', error);
      console.error('=================================\n');
    }
  });
  
  console.log('⏰ Expiry detection cron job scheduled (daily at 9:00 AM)');
};

module.exports = startExpiryDetectionJob;
