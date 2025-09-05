import cron from "node-cron";

interface ScheduledReminder {
  id: string;
  task: string;
  scheduledTime: Date;
  cronJob?: any;
}

const scheduledReminders = new Map<string, ScheduledReminder>();

export function scheduleReminder(task: string, scheduledTime: Date): string {
  const id = `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Convert the scheduled time to a cron expression
  const cronExpression = dateToCron(scheduledTime);
  
  if (!cronExpression) {
    throw new Error("Invalid scheduled time");
  }
  
  try {
    const cronJob = cron.schedule(cronExpression, () => {
      console.log(`🔔 Reminder: ${task}`);
      // In a real app, this would:
      // 1. Send a notification to the user
      // 2. Trigger a WebSocket event
      // 3. Update the reminder status in the database
      
      // Clean up the scheduled reminder
      scheduledReminders.delete(id);
    }, {
      timezone: "America/New_York" // Default timezone
    });
    
    const reminder: ScheduledReminder = {
      id,
      task,
      scheduledTime,
      cronJob
    };
    
    scheduledReminders.set(id, reminder);
    
    console.log(`📅 Scheduled reminder: ${task} at ${scheduledTime.toLocaleString()}`);
    return id;
  } catch (error) {
    console.error("Error scheduling reminder:", error);
    throw new Error("Failed to schedule reminder");
  }
}

export function cancelReminder(id: string): boolean {
  const reminder = scheduledReminders.get(id);
  if (!reminder) return false;
  
  if (reminder.cronJob) {
    reminder.cronJob.destroy();
  }
  
  scheduledReminders.delete(id);
  console.log(`❌ Cancelled reminder: ${reminder.task}`);
  return true;
}

export function getScheduledReminders(): ScheduledReminder[] {
  return Array.from(scheduledReminders.values()).map(({ cronJob, ...reminder }) => reminder);
}

function dateToCron(date: Date): string | null {
  try {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    // For one-time reminders, we create a cron that runs once
    // Format: "minute hour day month *"
    return `${minute} ${hour} ${day} ${month} *`;
  } catch (error) {
    console.error("Error converting date to cron:", error);
    return null;
  }
}
