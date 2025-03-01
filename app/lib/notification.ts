import nodemailer from 'nodemailer';
import { Telegraf } from 'telegraf';
import { format } from 'date-fns';

// 通知类型接口
export interface NotificationData {
  type: string;
  price: number;
  shortMA: number;
  longMA: number;
  timestamp: number;
}

// 发送电子邮件通知
async function sendEmailNotification(data: NotificationData): Promise<boolean> {
  try {
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
    
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.log('邮箱配置不完整，跳过邮件通知');
      return false;
    }
    
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
    
    const signalType = data.type === 'buy' ? '买入' : data.type === 'sell' ? '卖出' : '持有';
    const formattedDate = format(data.timestamp, 'yyyy-MM-dd HH:mm:ss');
    
    const mailOptions = {
      from: EMAIL_USER,
      to: EMAIL_USER,
      subject: `Solana ${signalType}信号 - ${formattedDate}`,
      html: `
        <h2>Solana ${signalType}信号</h2>
        <p><strong>时间:</strong> ${formattedDate}</p>
        <p><strong>当前价格:</strong> $${data.price.toFixed(2)}</p>
        <p><strong>短期MA:</strong> $${data.shortMA.toFixed(2)}</p>
        <p><strong>长期MA:</strong> $${data.longMA.toFixed(2)}</p>
        <p><strong>信号类型:</strong> ${signalType}</p>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    console.log('邮件通知发送成功');
    return true;
  } catch (error) {
    console.error('发送邮件通知失败:', error);
    return false;
  }
}

// 发送Telegram通知
async function sendTelegramNotification(data: NotificationData): Promise<boolean> {
  try {
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
    
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.log('Telegram配置不完整，跳过Telegram通知');
      return false;
    }
    
    const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
    const signalType = data.type === 'buy' ? '买入' : data.type === 'sell' ? '卖出' : '持有';
    const formattedDate = format(data.timestamp, 'yyyy-MM-dd HH:mm:ss');
    
    const message = `
🚨 *Solana ${signalType}信号* 🚨

📅 *时间:* ${formattedDate}
💰 *当前价格:* $${data.price.toFixed(2)}
📈 *短期MA:* $${data.shortMA.toFixed(2)}
📉 *长期MA:* $${data.longMA.toFixed(2)}
🔔 *信号类型:* ${signalType}
    `;
    
    await bot.telegram.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });
    console.log('Telegram通知发送成功');
    return true;
  } catch (error) {
    console.error('发送Telegram通知失败:', error);
    return false;
  }
}

// 发送所有配置的通知
export async function sendNotification(data: NotificationData): Promise<void> {
  try {
    // 只对买入和卖出信号发送通知
    if (data.type === 'hold') {
      console.log('持有信号，不发送通知');
      return;
    }
    
    const emailResult = await sendEmailNotification(data);
    const telegramResult = await sendTelegramNotification(data);
    
    if (!emailResult && !telegramResult) {
      console.warn('所有通知渠道发送失败或未配置');
    }
  } catch (error) {
    console.error('发送通知失败:', error);
  }
} 