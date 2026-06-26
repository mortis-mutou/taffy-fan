import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, message, Modal, Typography, Empty } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useUserStore } from '../../stores/userStore';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

const { Title, Paragraph } = Typography;

interface PendingPost {
    id: number;
    title: string;
    content: string;
    username: string;
    avatar_url: string;
    created_at: string;
}

export default function ReviewPosts() {
    const { user } = useUserStore();
    const navigate = useNavigate();
    const [posts, setPosts] = useState<PendingPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewPost, setViewPost] = useState<PendingPost | null>(null);

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchPendingPosts();
    }, [user]);

    const fetchPendingPosts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/posts/pending', {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                }
            });
            setPosts(res.data?.data || []);
        } catch (error: any) {
            console.error('获取待审核帖子失败', error);
            message.error('获取待审核帖子失败');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await api.patch(`/posts/${id}/approve`, { status: 'approved' }, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                }
            });
            message.success('审核通过');
            setPosts(posts.filter(p => p.id !== id));
        } catch (error) {
            message.error('操作失败');
        }
    };

    const handleReject = async (id: number) => {
        try {
            await api.patch(`/posts/${id}/approve`, { status: 'rejected' }, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                }
            });
            message.success('已拒绝');
            setPosts(posts.filter(p => p.id !== id));
        } catch (error) {
            message.error('操作失败');
        }
    };

    const columns = [
        { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
        { title: '作者', dataIndex: 'username', key: 'username' },
        {
            title: '发布时间',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (t: string) => new Date(t).toLocaleString()
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: PendingPost) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => setViewPost(record)}
                    >
                        查看
                    </Button>
                    <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        onClick={() => handleApprove(record.id)}
                    >
                        通过
                    </Button>
                    <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleReject(record.id)}
                    >
                        拒绝
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <Card>
                <Title level={3}>📝 帖子审核</Title>
                <Table
                    dataSource={posts}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    locale={{ emptyText: <Empty description="暂无待审核的帖子" /> }}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="帖子详情"
                open={!!viewPost}
                onCancel={() => setViewPost(null)}
                footer={
                    viewPost ? (
                        <Space>
                            <Button onClick={() => setViewPost(null)}>关闭</Button>
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                onClick={() => {
                                    handleApprove(viewPost.id);
                                    setViewPost(null);
                                }}
                            >
                                通过
                            </Button>
                            <Button
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => {
                                    handleReject(viewPost.id);
                                    setViewPost(null);
                                }}
                            >
                                拒绝
                            </Button>
                        </Space>
                    ) : null
                }
                width={700}
            >
                {viewPost && (
                    <div>
                        <Title level={4}>{viewPost.title}</Title>
                        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{viewPost.content}</Paragraph>
                        <p style={{ color: '#999' }}>
                            作者：{viewPost.username} | 发布于：{new Date(viewPost.created_at).toLocaleString()}
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
}