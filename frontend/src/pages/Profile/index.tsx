import { useEffect, useState } from 'react';
import { Card, Avatar, Typography, Button, List, Space, message, Empty, Modal, Form, Input, Upload } from 'antd';
import { UserOutlined, MailOutlined, EditOutlined, LogoutOutlined, HeartOutlined, MessageOutlined, UploadOutlined } from '@ant-design/icons';
import { useUserStore } from '../../stores/userStore';
import { postAPI, Post } from '../../api/post';
import { userAPI } from '../../api/user';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function Profile() {
    const { user, logout, fetchUser } = useUserStore();
    const [myPosts, setMyPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (user) {
            fetchMyPosts();
        }
    }, [user]);

    const fetchMyPosts = async () => {
        setLoading(true);
        try {
            const res = await postAPI.getPosts(1, 10);
            const postsData = res.data?.data || [];
            const userPosts = postsData.filter((post: Post) => post.user_id === user?.id);
            setMyPosts(userPosts);
        } catch (error) {
            console.error('获取我的帖子失败', error);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = () => {
        form.setFieldsValue({
            username: user?.username,
            signature: user?.signature || '',
            avatar_url: user?.avatar_url || '',
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        try {
            const values = await form.validateFields();
            setEditLoading(true);
            await userAPI.updateProfile({
                username: values.username,
                signature: values.signature,
                avatar_url: values.avatar_url,
            });
            message.success('资料更新成功！');
            setEditModalOpen(false);
            await fetchUser(); // 添加 await 确保用户信息已更新
        } catch (error: any) {
            if (error?.errorFields) return;
            message.error(error?.response?.data?.error || '更新失败，请稍后重试');
        } finally {
            setEditLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* 个人信息卡片 */}
            <Card style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Avatar src={user.avatar_url} size={80} icon={<UserOutlined />} />
                    <div style={{ flex: 1 }}>
                        <Title level={3} style={{ marginBottom: 4 }}>{user.username}</Title>
                        <Text type="secondary">{user.signature || '永雏塔菲赛高！'}</Text>
                        <div style={{ marginTop: 12 }}>
                            <Space>
                                <Text><MailOutlined /> {user.email}</Text>
                                <Text>👑 {user.role === 'admin' ? '管理员' : '普通粉丝'}</Text>
                            </Space>
                        </div>
                    </div>
                    <Space direction="vertical">
                        <Button icon={<EditOutlined />} onClick={openEditModal}>编辑资料</Button>
                        <Button danger icon={<LogoutOutlined />} onClick={logout}>退出登录</Button>
                    </Space>
                </div>
            </Card>

            {/* 统计卡片 */}
            <Card style={{ marginBottom: 24 }}>
                <Space size={48} split="|">
                    <div style={{ textAlign: 'center' }}>
                        <Title level={3} style={{ marginBottom: 0, color: '#ff69b4' }}>{myPosts.length}</Title>
                        <Text type="secondary">我的帖子</Text>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Title level={3} style={{ marginBottom: 0, color: '#ff69b4' }}>0</Title>
                        <Text type="secondary">获得的点赞</Text>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Title level={3} style={{ marginBottom: 0, color: '#ff69b4' }}>{dayjs(user.created_at).format('YYYY-MM-DD')}</Title>
                        <Text type="secondary">加入日期</Text>
                    </div>
                </Space>
            </Card>

            {/* 我的帖子 */}
            <Card title="我的帖子">
                <List
                    loading={loading}
                    dataSource={myPosts}
                    renderItem={(post) => (
                        <List.Item
                            actions={[
                                <Space key="likes">
                                    <HeartOutlined /> {post.like_count}
                                </Space>,
                                <Space key="replies">
                                    <MessageOutlined /> {post.reply_count}
                                </Space>,
                            ]}
                        >
                            <List.Item.Meta
                                title={<Link to={`/post/${post.id}`}>{post.title}</Link>}
                                description={
                                    <Space split="·">
                                        <Text type="secondary">{dayjs(post.created_at).format('YYYY-MM-DD HH:mm')}</Text>
                                        <Text type="secondary">{post.view_count} 浏览</Text>
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                />
                {myPosts.length === 0 && !loading && (
                    <Empty description="还没有发布过帖子，快去发布吧！" />
                )}
            </Card>

            {/* 编辑资料弹窗 — 补全缺失的 Modal */}
            <Modal
                title="编辑个人资料"
                open={editModalOpen}
                onOk={handleEditSubmit}
                onCancel={() => setEditModalOpen(false)}
                confirmLoading={editLoading}
                okText="保存"
                cancelText="取消"
            >
                <Form
                    form={form}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        label="用户名"
                        name="username"
                        rules={[
                            { required: true, message: '请输入用户名' },
                            { min: 2, message: '用户名至少2个字符' },
                            { max: 20, message: '用户名最多20个字符' },
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
                    </Form.Item>
                    <Form.Item
                        label="个人签名"
                        name="signature"
                        rules={[{ max: 100, message: '签名最多100个字符' }]}
                    >
                        <Input placeholder="请输入个人签名（选填）" />
                    </Form.Item>
                    <Form.Item
                        label="头像链接"
                        name="avatar_url"
                    >
                        <Input placeholder="请输入头像图片链接（选填）" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}