import { useEffect, useState } from 'react';
import { Badge, Popover, List, Typography, Button, Empty, Spin } from 'antd';
import { BellOutlined, HeartOutlined, MessageOutlined, UserOutlined, InfoCircleOutlined, WechatOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../api/notifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Text } = Typography;

interface Notification {
    id: number;
    type: string;
    content: string;
    related_id: number | null;
    is_read: boolean;
    created_at: string;
}

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const res = await notificationAPI.getUnreadCount();
            setUnreadCount(res.data.count);
        } catch {}
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await notificationAPI.getNotifications(1);
            setNotifications(res.data.data || []);
        } catch {}
        setLoading(false);
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen) {
            fetchNotifications();
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAsRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch {}
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <HeartOutlined style={{ color: '#ff69b4' }} />;
            case 'reply': return <MessageOutlined style={{ color: '#69c0ff' }} />;
            case 'follow': return <UserOutlined style={{ color: '#52c41a' }} />;
            case 'message': return <WechatOutlined style={{ color: '#722ed1' }} />;
            default: return <InfoCircleOutlined style={{ color: '#faad14' }} />;
        }
    };

    const handleNotificationClick = (item: Notification) => {
        if (!item.is_read) {
            notificationAPI.markAsRead([item.id]);
        }
        // 私信通知跳转到私信页面
        if (item.type === 'message') {
            navigate('/messages');
        } else if (item.related_id) {
            navigate(`/post/${item.related_id}`);
        }
        setOpen(false);
    };

    const content = (
        <div style={{ width: 350, maxHeight: 400 }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 16px',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <Text strong style={{ color: '#4a2c3a' }}>通知</Text>
                {unreadCount > 0 && (
                    <Button type="link" size="small" onClick={handleMarkAllRead} style={{ color: '#ff69b4' }}>
                        全部已读
                    </Button>
                )}
            </div>
            {loading ? (
                <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
            ) : notifications.length === 0 ? (
                <Empty description="暂无通知" style={{ padding: 24 }} />
            ) : (
                <List
                    dataSource={notifications.slice(0, 10)}
                    renderItem={item => (
                        <List.Item
                            style={{
                                padding: '10px 16px',
                                background: item.is_read ? 'transparent' : '#fff0f5',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleNotificationClick(item)}
                        >
                            <List.Item.Meta
                                avatar={getIcon(item.type)}
                                title={
                                    <Text style={{ fontSize: 13, color: '#4a2c3a' }}>
                                        {item.type === 'message' ? '💬 新私信' : item.content}
                                    </Text>
                                }
                                description={
                                    <div>
                                        {item.type === 'message' && (
                                            <Text style={{ fontSize: 12, color: '#666' }} ellipsis>
                                                {item.content}
                                            </Text>
                                        )}
                                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                                            {dayjs(item.created_at).fromNow()}
                                        </Text>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
        </div>
    );

    return (
        <Popover
            content={content}
            trigger="click"
            open={open}
            onOpenChange={handleOpenChange}
            placement="bottomRight"
        >
            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                <BellOutlined style={{ fontSize: 20, color: 'rgba(255,255,255,0.85)', cursor: 'pointer' }} />
            </Badge>
        </Popover>
    );
}