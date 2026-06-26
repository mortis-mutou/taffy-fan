import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Avatar, Button, Input, List, Space, message, Popconfirm, Empty, Spin, Divider, Tooltip } from 'antd';
import { ArrowLeftOutlined, HeartOutlined, HeartFilled, MessageOutlined, DeleteOutlined, EyeOutlined, SendOutlined } from '@ant-design/icons';
import { postAPI, Post } from '../../api/post';
import { replyAPI, Reply } from '../../api/reply';
import { messageAPI } from '../../api/messages';
import { useUserStore } from '../../stores/userStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function PostDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useUserStore();
    
    const [post, setPost] = useState<Post | null>(null);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [replyPage, setReplyPage] = useState(1);
    const [replyTotal, setReplyTotal] = useState(0);
        const [liking, setLiking] = useState(false);
    const [sendingMsg, setSendingMsg] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            fetchPost();
            fetchReplies();
        }
    }, [id, replyPage]);

    const fetchPost = async () => {
        try {
            const res = await postAPI.getPostById(Number(id));
            setPost(res.data);
        } catch (error) {
            message.error('获取帖子失败');
            navigate('/');
        }
    };

    const fetchReplies = async () => {
        try {
            const res = await replyAPI.getReplies(Number(id), replyPage);
            setReplies(res.data.data);
            setReplyTotal(res.data.pagination.total);
        } catch (error) {
            console.error('获取回帖失败', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!user) {
            message.warning('请先登录');
            navigate('/login');
            return;
        }
        setLiking(true);
        try {
            const res = await postAPI.likePost(Number(id));
            setPost(prev => prev ? {
                ...prev,
                like_count: res.data.like_count,
                is_liked: res.data.is_liked
            } : null);
            message.success(res.data.is_liked ? '点赞成功' : '取消点赞');
        } catch (error) {
            message.error('操作失败');
        } finally {
            setLiking(false);
        }
    };

    const handleReply = async () => {
        if (!replyContent.trim()) {
            message.warning('请输入回帖内容');
            return;
        }
        if (!user) {
            message.warning('请先登录');
            navigate('/login');
            return;
        }

        setSubmitting(true);
        try {
            await replyAPI.createReply(Number(id), replyContent);
            message.success('回帖成功');
            setReplyContent('');
            fetchReplies();
            setPost(prev => prev ? { ...prev, reply_count: prev.reply_count + 1 } : null);
        } catch (error) {
            message.error('回帖失败');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReply = async (replyId: number) => {
        try {
            await replyAPI.deleteReply(replyId);
            message.success('删除成功');
            fetchReplies();
            setPost(prev => prev ? { ...prev, reply_count: prev.reply_count - 1 } : null);
        } catch (error) {
            message.error('删除失败');
        }
    };

        const handleDeletePost = async () => {
        try {
            await postAPI.deletePost(Number(id));
            message.success('删除成功');
            navigate('/');
        } catch (error) {
            message.error('删除失败');
        }
    };

    // 发起私信
    const handleSendMessage = async (userId: number, username: string) => {
        if (!user) {
            message.warning('请先登录');
            navigate('/login');
            return;
        }
        if (user.id === userId) {
            message.info('不能给自己发私信哦~');
            return;
        }
        setSendingMsg(userId);
        try {
            await messageAPI.sendMessage(userId, `你好！我在「${post?.title}」这个帖子看到你啦~`);
            message.success(`已向 ${username} 发送私信！💬`);
        } catch (error: any) {
            message.error(error?.response?.data?.error || '发送失败');
        } finally {
            setSendingMsg(null);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!post) {
        return <Empty description="帖子不存在" />;
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
                返回
            </Button>

            <Card style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', gap: 16, flex: 1 }}>
                        <div style={{ position: 'relative' }}>
                            <Avatar src={post.avatar_url} size={48} />
                            {user && user.id !== post.user_id && (
                                <Tooltip title="发私信">
                                    <Button
                                        type="primary"
                                        size="small"
                                        shape="circle"
                                        icon={<SendOutlined />}
                                        loading={sendingMsg === post.user_id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSendMessage(post.user_id, post.username);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            bottom: -6,
                                            right: -6,
                                            width: 22,
                                            height: 22,
                                            minWidth: 22,
                                            backgroundColor: '#ff69b4',
                                            borderColor: '#ff69b4',
                                            fontSize: 11,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                                <Text strong style={{ fontSize: 16 }}>{post.username}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(post.created_at).fromNow()}</Text>
                                {post.is_pinned && <Text style={{ color: '#ff69b4' }}>📌 置顶</Text>}
                            </div>
                            <Title level={3} style={{ marginTop: 8, marginBottom: 16 }}>
                                {post.title}
                            </Title>
                            <div 
                                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
                                style={{ lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}
                            />
                            <Divider style={{ margin: '16px 0' }} />
                            <Space size={24}>
                                <Space>
                                    <EyeOutlined /> {post.view_count} 浏览
                                </Space>
                                <Button 
                                    type="text" 
                                    icon={post.is_liked ? <HeartFilled style={{ color: '#ff69b4' }} /> : <HeartOutlined />}
                                    onClick={handleLike}
                                    loading={liking}
                                >
                                    {post.like_count} 点赞
                                </Button>
                                <Space>
                                    <MessageOutlined /> {post.reply_count} 回复
                                </Space>
                            </Space>
                        </div>
                    </div>
                    {(user?.id === post.user_id || user?.role === 'admin') && (
                        <Popconfirm
                            title="确定要删除这篇帖子吗？"
                            onConfirm={handleDeletePost}
                            okText="删除"
                            cancelText="取消"
                        >
                            <Button danger icon={<DeleteOutlined />} size="small">删除</Button>
                        </Popconfirm>
                    )}
                </div>
            </Card>

            <Card title={`发表回复 (${replyTotal})`} style={{ marginBottom: 24 }}>
                <TextArea
                    rows={4}
                    placeholder={user ? "写下你的回复..." : "请先登录后再回复"}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    disabled={!user}
                />
                <div style={{ marginTop: 12, textAlign: 'right' }}>
                    <Button 
                        type="primary" 
                        onClick={handleReply} 
                        loading={submitting}
                        disabled={!user}
                    >
                        发布回复
                    </Button>
                </div>
            </Card>

            <Card title={`全部回复 (${replyTotal})`}>
                <List
                    dataSource={replies}
                    renderItem={(reply) => (
                        <List.Item
                            key={reply.id}
                            actions={[
                                (user?.id === reply.user_id || user?.role === 'admin') && (
                                    <Popconfirm
                                        title="确定删除这条回复？"
                                        onConfirm={() => handleDeleteReply(reply.id)}
                                        okText="删除"
                                        cancelText="取消"
                                    >
                                        <Button type="link" danger icon={<DeleteOutlined />} size="small">
                                            删除
                                        </Button>
                                    </Popconfirm>
                                )
                            ].filter(Boolean)}
                        >
                            <List.Item.Meta
                                                                avatar={
                                    <div style={{ position: 'relative' }}>
                                        <Avatar src={reply.avatar_url} />
                                        {user && user.id !== reply.user_id && (
                                            <Tooltip title="发私信">
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    shape="circle"
                                                    icon={<SendOutlined />}
                                                    loading={sendingMsg === reply.user_id}
                                                    onClick={() => handleSendMessage(reply.user_id, reply.username)}
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: -4,
                                                        right: -4,
                                                        width: 18,
                                                        height: 18,
                                                        minWidth: 18,
                                                        backgroundColor: '#ff69b4',
                                                        borderColor: '#ff69b4',
                                                        fontSize: 10,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                />
                                            </Tooltip>
                                        )}
                                    </div>
                                }
                                title={
                                    <Space>
                                        <Text strong>{reply.username}</Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {dayjs(reply.created_at).fromNow()}
                                        </Text>
                                    </Space>
                                }
                                description={
                                    <div style={{ marginTop: 8, marginBottom: 0 }}>
                                        {reply.content}
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
                {replies.length === 0 && !loading && (
                    <Empty description="暂无回复，抢沙发吧！" />
                )}
            </Card>
        </div>
    );
}