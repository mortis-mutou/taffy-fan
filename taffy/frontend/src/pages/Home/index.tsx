import { useEffect, useState } from 'react';
import { List, Card, Avatar, Typography, Spin, Empty, Tag, Space, Input, Button, Pagination } from 'antd';
import { HeartOutlined, MessageOutlined, EyeOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { postAPI, Post } from '../../api/post';
import { useUserStore } from '../../stores/userStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Text } = Typography;
const { Search } = Input;

export default function Home() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [keyword, setKeyword] = useState('');
    const navigate = useNavigate();
    const { user } = useUserStore();

    const pageSize = 10;

    useEffect(() => {
        fetchPosts();
    }, [page, keyword]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await postAPI.getPosts(page, pageSize, keyword);
                        setPosts(res.data?.data || []);
                        setTotal(res.data?.pagination?.total || 0);
        } catch (error) {
            console.error('获取帖子失败', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setKeyword(value);
        setPage(1);
    };

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* 🎀 粉色可爱欢迎横幅 */}
            <Card style={{ 
                marginBottom: 24, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ff69b4, #ff1493)',
                border: 'none',
                borderRadius: 16,
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* 装饰性背景元素 */}
                <div style={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    fontSize: 80,
                    opacity: 0.15,
                    transform: 'rotate(15deg)'
                }}>🎀</div>
                <div style={{
                    position: 'absolute',
                    bottom: -10,
                    left: -10,
                    fontSize: 60,
                    opacity: 0.1,
                    transform: 'rotate(-10deg)'
                }}>🌸</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                        <Title level={3} style={{ color: 'white', marginBottom: 8 }}>
                            🎀 欢迎来到永雏塔菲粉丝社区 🎀
                                </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>
                            这里是塔菲粉丝的温暖小窝，一起分享塔菲的可爱瞬间吧！🌸
                                </Text>
                                </div>
                    {user && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                            onClick={() => navigate('/create-post')}
                            style={{
                                backgroundColor: 'white',
                                color: '#181617',
                                border: 'none',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                            }}
                        >
                            发帖冲鸭！
                        </Button>
            )}
                </div>
            </Card>

            {/* 搜索框 */}
            <div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <Search
                    placeholder="搜索帖子..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    onSearch={handleSearch}
                    style={{ flex: 1 }}
                    />
                {!user && (
                    <Button
                        type="primary"
                        onClick={() => navigate('/login')}
                    >
                        登录后发帖呐~
                    </Button>
                )}
        </div>

            {/* 帖子列表 */}
            <List
                loading={loading}
                dataSource={posts}
                renderItem={(post) => (
                    <Card
                        style={{
                            marginBottom: 16,
                            cursor: 'pointer',
                            borderRadius: 16,
                            transition: 'all 0.3s ease',
                            border: '1px solid #ffe4ec',
                            boxShadow: '0 2px 12px rgba(255,105,180,0.1)'
                        }}
                        hoverable
                        onClick={() => navigate(`/post/${post.id}`)}
                    >
                        <div style={{ display: 'flex', gap: 16 }}>
                            <Avatar src={post.avatar_url} size={48} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                                    <Text strong style={{ fontSize: 15, color: '#4a2c3a' }}>{post.username}</Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {dayjs(post.created_at).fromNow()}
                                    </Text>
                                    {post.is_pinned && <Tag color="#ff69b4">📌 置顶</Tag>}
                                </div>
                                <Title level={4} style={{ marginBottom: 12, color: '#4a2c3a' }}>
                                    {post.title}
                                </Title>
                                <Text type="secondary" style={{ fontSize: 14, color: '#8c6b7a' }}>
                                    {post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content}
                                </Text>
                                <div style={{ marginTop: 16 }}>
                                    <Space size={24}>
                                        <Space>
                                            <EyeOutlined style={{ color: '#b08898' }} />
                                            <Text style={{ color: '#8c6b7a' }}>{post.view_count}</Text>
                                        </Space>
                                        <Space>
                                            <HeartOutlined style={{ color: '#ff69b4' }} />
                                            <Text style={{ color: '#8c6b7a' }}>{post.like_count}</Text>
                                        </Space>
                                        <Space>
                                            <MessageOutlined style={{ color: '#69c0ff' }} />
                                            <Text style={{ color: '#8c6b7a' }}>{post.reply_count}</Text>
                                        </Space>
                                    </Space>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            />

            {!loading && posts.length === 0 && (
                <Empty
                    description="这里还没有内容哦~ 快来第一个发言吧！"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            )}

            {/* 分页 */}
            {total > pageSize && (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Pagination
                        current={page}
                        total={total}
                        pageSize={pageSize}
                        onChange={setPage}
                        showSizeChanger={false}
                    />
                </div>
            )}
        </div>
    );
}