// 内存数据存储 - 用于替代数据库，当无法连接数据库时使用
// 模拟数据库表

interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  avatar_url: string;
  signature: string;
  created_at: string;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Notification {
  id: number;
  user_id: number;
  type: string;
  content: string;
  related_id: number;
  is_read: boolean;
  created_at: string;
}

class MemoryStore {
  private users: User[] = [];
  private messages: Message[] = [];
  private notifications: Notification[] = [];
  private nextUserId = 1;
  private nextMessageId = 1;
  private nextNotificationId = 1;

  constructor() {
    // 创建默认管理员用户，方便测试
    this.createDefaultUsers();
  }

  private createDefaultUsers() {
    // 使用简单密码方便测试，正式环境应该加密
    const bcrypt = require('bcryptjs');
    const defaultPassword = bcrypt.hashSync('123456', 10);
    this.users = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@test.com',
        password_hash: defaultPassword,
        role: 'admin',
        avatar_url: '',
        signature: '我是管理员 🎀',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        username: 'user1',
        email: 'user1@test.com',
        password_hash: defaultPassword,
        role: 'user',
        avatar_url: '',
        signature: '测试用户1',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        username: 'user2',
        email: 'user2@test.com',
        password_hash: defaultPassword,
        role: 'user',
        avatar_url: '',
        signature: '测试用户2',
        created_at: new Date().toISOString()
      }
    ];
    this.nextUserId = 4;
    console.log('✅ 内存数据库初始化完成，已创建默认用户：admin/user1/user2，密码都是：123456');
  }

  // ============ 用户相关 ============
  findUserByUsername(username: string): User | undefined {
    return this.users.find(u => u.username === username || u.email === username);
  }

  findUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }

  findUserById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }

  createUser(username: string, email: string, password_hash: string): User {
    const user: User = {
      id: this.nextUserId++,
      username,
      email,
      password_hash,
      role: 'user',
      avatar_url: '',
      signature: '',
      created_at: new Date().toISOString()
    };
    this.users.push(user);
    return user;
  }

  // ============ 私信相关 ============
  getConversations(userId: number): any[] {
    // 获取当前用户参与的会话列表
    const conversationMap = new Map<number, any>();

    this.messages.forEach(msg => {
      if (msg.sender_id === userId || msg.receiver_id === userId) {
        const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        const otherUser = this.findUserById(otherUserId);

        if (!otherUser) return;

        if (!conversationMap.has(otherUserId) ||
            new Date(msg.created_at) > new Date(conversationMap.get(otherUserId).last_message_time)) {
          const unreadCount = this.messages.filter(m =>
            m.sender_id === otherUserId && m.receiver_id === userId && !m.is_read
          ).length;

          conversationMap.set(otherUserId, {
            other_user_id: otherUserId,
            username: otherUser.username,
            avatar_url: otherUser.avatar_url,
            last_message: msg.content,
            last_message_time: msg.created_at,
            is_read: msg.is_read,
            unread_count: unreadCount
          });
        }
      }
    });

    // 按时间排序
    return Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());
  }

  getMessages(userId: number, otherUserId: number, page: number = 1, pageSize: number = 50): Message[] {
    const filtered = this.messages.filter(msg =>
      (msg.sender_id === userId && msg.receiver_id === otherUserId) ||
      (msg.sender_id === otherUserId && msg.receiver_id === userId)
    );

    // 排序后按分页取
    const sorted = filtered.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paged = sorted.slice(start, end);

    // 标记为已读
    this.messages.forEach(msg => {
      if (msg.sender_id === otherUserId && msg.receiver_id === userId) {
        msg.is_read = true;
      }
    });

    return paged.reverse();
  }

  sendMessage(senderId: number, receiverId: number, content: string): Message {
    const message: Message = {
      id: this.nextMessageId++,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      is_read: false,
      created_at: new Date().toISOString()  // 使用服务器本地时间
    };
    this.messages.push(message);
    return message;
  }

  // ============ 通知相关 ============
  createNotification(userId: number, type: string, content: string, relatedId: number): Notification {
    const notification: Notification = {
      id: this.nextNotificationId++,
      user_id: userId,
      type,
      content,
      related_id: relatedId,
      is_read: false,
      created_at: new Date().toISOString()
    };
    this.notifications.push(notification);
    return notification;
  }

  getNotifications(userId: number): Notification[] {
    return this.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  deleteUserNotifications(userId: number, type: string): void {
    this.notifications = this.notifications.filter(
      n => !(n.user_id === userId && n.type === type)
    );
  }

  markNotificationsRead(userId: number): void {
    this.notifications.forEach(n => {
      if (n.user_id === userId) {
        n.is_read = true;
      }
    });
  }

  // 工具方法
  getAllUsers(): User[] {
    return this.users;
  }
}

// 导出单例
export const memoryStore = new MemoryStore();
export default memoryStore;