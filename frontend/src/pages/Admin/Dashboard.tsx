import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Button, Space, message, Switch } from 'antd';
import { UserOutlined, FileTextOutlined, VideoCameraOutlined, MessageOutlined, PushpinOutlined } from '@ant-design/icons';
import { useUserStore } from '../../stores/userStore';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../../api/post';
import api from '../../api/client';

const { Title } = Typography;

export default function AdminDashboard() {
    const { user } = useUserStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        users: 0,
        posts: 0,
        videos: 0,
        replies: 0
    });
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            // 使用已有的API获取统计数据
            const [postsRes, videosRes] = await Promise.all([
                api.get('/posts?pageSize=100'),
                api.get('/videos?pageSize=100')
            ]);

            const posts = postsRes.data?.data || [];
            const videos = videosRes.data?.data || [];

            setStats({
                users: new Set([...posts.map((p: any) => p.user_id)]).size,
                posts: posts.length,
                videos: videos.length,
                replies: posts.reduce((sum: number, p: any) => sum + (p.reply_count || 0), 0)
            });

            setRecentPosts(posts.slice(0, 10));
        } catch (error) {
            console.error('获取统计失败', error);
        }
    };

    const handlePinToggle = async (postId: number, currentPinned: boolean) => {
        setLoading(true);
        try {
            await postAPI.pinPost(postId, !currentPinned);
            message.success(currentPinned ? '已取消置顶' : '置顶成功');
            // 刷新数据
            fetchStats();
        } catch (error) {
            console.error('置顶操作失败', error);
            message.error('操作失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
        { title: '作者', dataIndex: 'username', key: 'username' },
        { title: '浏览量', dataIndex: 'view_count', key: 'view_count' },
        { title: '点赞', dataIndex: 'like_count', key: 'like_count' },
        { title: '回复', dataIndex: 'reply_count', key: 'reply_count' },
        {
            title: '置顶',
            dataIndex: 'is_pinned',
            key: 'is_pinned',
            render: (pinned: boolean) => pinned ? <Tag color="#ff69b4">📌 是</Tag> : <Tag>否</Tag>
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type={record.is_pinned ? 'primary' : 'default'}
                        icon={<PushpinOutlined />}
                        size="small"
                        loading={loading}
                        onClick={() => handlePinToggle(record.id, record.is_pinned)}
                        style={record.is_pinned ? { backgroundColor: '#ff69b4', borderColor: '#ff69b4' } : {}}
                    >
                        {record.is_pinned ? '取消置顶' : '置顶'}
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <Title level={3}>🎀 管理面板</Title>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card hoverable>
                        <Statistic
                            title="活跃粉丝"
                            value={stats.users}
                            prefix={<UserOutlined style={{ color: '#ff69b4' }} />}
                            valueStyle={{ color: '#ff69b4' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card hoverable>
                        <Statistic
                            title="帖子总数"
                            value={stats.posts}
                            prefix={<FileTextOutlined style={{ color: '#ff85c0' }} />}
                            valueStyle={{ color: '#ff85c0' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card hoverable>
                        <Statistic
                            title="视频总数"
                            value={stats.videos}
                            prefix={<VideoCameraOutlined style={{ color: '#ff1493' }} />}
                            valueStyle={{ color: '#ff1493' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card hoverable>
                        <Statistic
                            title="总回复数"
                            value={stats.replies}
                            prefix={<MessageOutlined style={{ color: '#c2185b' }} />}
                            valueStyle={{ color: '#c2185b' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="最新帖子">
                <Table
                    dataSource={recentPosts}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                />
            </Card>
        </div>
    );
}