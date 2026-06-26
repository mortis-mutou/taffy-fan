import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Space, message, Spin, Empty, Divider } from 'antd';
import { ArrowLeftOutlined, HeartOutlined, HeartFilled, EyeOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { videoAPI, Video } from '../../api/video';
import { useUserStore } from '../../stores/userStore';

const { Title, Paragraph, Text } = Typography;

export default function VideoDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        if (id) {
            fetchVideo();
        }
    }, [id]);

    const fetchVideo = async () => {
        setLoading(true);
        try {
            const res = await videoAPI.getVideoById(Number(id));
            setVideo(res.data);
            setLiked(res.data.is_liked || false);
            setLikeCount(res.data.like_count);
        } catch (error) {
            message.error('获取视频失败');
            navigate('/videos');
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
        try {
            await videoAPI.likeVideo(Number(id));
            if (liked) {
                setLikeCount(prev => prev - 1);
                setLiked(false);
            } else {
                setLikeCount(prev => prev + 1);
                setLiked(true);
            }
        } catch (error) {
            message.error('操作失败');
        }
    };

    // ✅ 关键修复：添加视频跳转函数
    const handleWatchVideo = () => {
        if (video?.video_url) {
            window.open(video.video_url, '_blank');
        } else {
            message.error('视频链接不存在');
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!video) {
        return <Empty description="视频不存在" />;
    }

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
                返回
            </Button>

            <Card>
                {/* ✅ 修复：整个封面区域可点击跳转 */}
                <div
                    style={{
                        background: '#000',
                        borderRadius: 8,
                        overflow: 'hidden',
                        position: 'relative',
                        paddingBottom: '56.25%',
                        marginBottom: 24,
                        cursor: 'pointer'
                    }}
                    onClick={handleWatchVideo}
                >
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#1a1a2e'
                    }}>
                        <img
                            src={video.cover_url || 'https://picsum.photos/800/450'}
                            alt={video.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://picsum.photos/800/450';
                            }}
                        />
                        {/* 播放按钮覆盖层 */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            color: 'white'
                        }}>
                            <div style={{
                                fontSize: 64,
                                cursor: 'pointer',
                                background: 'rgba(0,0,0,0.6)',
                                borderRadius: '50%',
                                width: 80,
                                height: 80,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                ▶
                            </div>
                            <Text style={{ color: 'white', marginTop: 16, display: 'block' }}>
                                点击跳转B站观看完整视频
                            </Text>
                        </div>
                    </div>
                </div>

                <Title level={3}>{video.title}</Title>
                
                <Space size={24} style={{ marginBottom: 16 }}>
                    <Space>
                        <EyeOutlined /> {video.view_count} 次观看
                    </Space>
                    <Button
                        type={liked ? 'primary' : 'default'}
                        icon={liked ? <HeartFilled /> : <HeartOutlined />}
                        onClick={handleLike}
                        style={{ borderColor: liked ? '#ff69b4' : undefined }}
                    >
                        {likeCount} 点赞
                    </Button>
                </Space>

                <Divider />

                <Title level={5}>简介</Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                    {video.description}
                </Paragraph>

                <Divider />

                {/* ✅ 新增：明显的观看按钮 */}
                <Button 
                    type="primary" 
                    size="large"
                    icon={<PlayCircleOutlined />}
                    onClick={handleWatchVideo}
                    style={{ 
                        background: '#00a1d6', 
                        borderColor: '#00a1d6',
                        width: '100%',
                        height: 48,
                        fontSize: 16,
                        marginTop: 8
                    }}
                >
                    前往B站观看完整视频
                </Button>

                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 16, textAlign: 'center' }}>
                    视频来源：Bilibili · 点击上方按钮跳转观看
                </Text>
            </Card>
        </div>
    );
}