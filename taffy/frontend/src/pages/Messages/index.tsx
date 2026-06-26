import { useEffect, useState, useRef } from 'react';
import { Card, List, Input, Button, Avatar, Typography, Space, Empty, Spin, message } from 'antd';
import { SendOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { messageAPI, Conversation, Message } from '../../api/messages';
import { useUserStore } from '../../stores/userStore';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

export default function Messages() {
    const { user } = useUserStore();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConv, setActiveConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await messageAPI.getConversations();
            setConversations(res.data);
        } catch {}
        setLoading(false);
    };

    const openConversation = async (conv: Conversation) => {
        setActiveConv(conv);
        try {
            const res = await messageAPI.getMessages(conv.other_user_id);
            setMessages(res.data);
        } catch {}
    };

    const sendMessage = async () => {
        if (!input.trim() || !activeConv) return;
        setSending(true);
        try {
            const res = await messageAPI.sendMessage(activeConv.other_user_id, input);
            setMessages(prev => [...prev, res.data]);
            setInput('');
            fetchConversations();
        } catch {
            message.error('发送失败');
        }
        setSending(false);
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
    }

    // 移动端显示消息列表还是聊天
    const showChat = activeConv && window.innerWidth < 768;

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Card style={{ borderRadius: 16 }}>
                <div style={{ display: 'flex', minHeight: 500 }}>
                    {/* 会话列表 */}
                    <div style={{
                        width: showChat ? 0 : 280,
                        borderRight: '1px solid #f0f0f0',
                        overflow: 'auto',
                        display: showChat ? 'none' : 'block'
                    }}>
                        <Title level={5} style={{ padding: '12px 16px', margin: 0, color: '#4a2c3a' }}>
                            私信
                        </Title>
                        <List
                            dataSource={conversations}
                            renderItem={conv => (
                                <List.Item
                                    key={conv.other_user_id}
                                    onClick={() => openConversation(conv)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '12px 16px',
                                        background: activeConv?.other_user_id === conv.other_user_id ? '#fff0f5' : 'transparent',
                                        borderLeft: activeConv?.other_user_id === conv.other_user_id ? '3px solid #ff69b4' : '3px solid transparent'
                                    }}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={conv.avatar_url} />}
                                        title={
                                            <Space>
                                                <Text style={{ color: '#4a2c3a' }}>{conv.username}</Text>
                                                {conv.unread_count > 0 && (
                                                    <span style={{
                                                        background: '#ff69b4',
                                                        color: 'white',
                                                        borderRadius: 10,
                                                        padding: '0 6px',
                                                        fontSize: 11
                                                    }}>{conv.unread_count}</span>
                                                )}
                                            </Space>
                                        }
                                        description={
                                            <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                                                {conv.last_message}
                                            </Text>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                        {conversations.length === 0 && (
                            <Empty description="暂无私信" style={{ padding: 24 }} />
                        )}
                    </div>

                    {/* 聊天区域 */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {activeConv ? (
                            <>
                                <div style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid #f0f0f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12
                                }}>
                                    {showChat && (
                                        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setActiveConv(null)} />
                                    )}
                                    <Avatar src={activeConv.avatar_url} size={32} />
                                    <Text strong style={{ color: '#4a2c3a' }}>{activeConv.username}</Text>
                                </div>
                                <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                                    {messages.map(msg => (
                                        <div key={msg.id} style={{
                                            display: 'flex',
                                            justifyContent: msg.sender_id === user?.id ? 'flex-end' : 'flex-start',
                                            marginBottom: 12
                                        }}>
                                            <div style={{
                                                maxWidth: '70%',
                                                padding: '8px 14px',
                                                borderRadius: 16,
                                                background: msg.sender_id === user?.id ? '#ff69b4' : '#f0f0f0',
                                                color: msg.sender_id === user?.id ? 'white' : '#4a2c3a',
                                                fontSize: 14
                                            }}>
                                                {msg.content}
                                                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>
                                                    {dayjs(msg.created_at).isSame(dayjs(), 'day')
                                                        ? dayjs(msg.created_at).format('HH:mm')
                                                        : dayjs(msg.created_at).isSame(dayjs().subtract(1, 'day'), 'day')
                                                        ? `昨天 ${dayjs(msg.created_at).format('HH:mm')}`
                                                        : dayjs(msg.created_at).format('MM/DD HH:mm')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
                                    <Input
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onPressEnter={sendMessage}
                                        placeholder="输入消息..."
                                        style={{ borderRadius: 20 }}
                                    />
                                    <Button
                                        type="primary"
                                        icon={<SendOutlined />}
                                        onClick={sendMessage}
                                        loading={sending}
                                        style={{ borderRadius: '50%', width: 40, height: 40 }}
                                    />
                                </div>
                            </>
                        ) : (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Empty description="选择一个对话开始聊天" />
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}