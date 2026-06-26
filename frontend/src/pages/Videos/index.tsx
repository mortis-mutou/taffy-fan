import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Typography, Spin, Empty, Image, Space, Button, message, Pagination } from 'antd';
import { PlayCircleOutlined, HeartOutlined, HeartFilled, EyeOutlined } from '@ant-design/icons';
import { videoAPI, Video } from '../../api/video';
import { useUserStore } from '../../stores/userStore';

const { Title, Paragraph, Text } = Typography;

export default function Videos() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const { user } = useUserStore();

    useEffect(() => {
        fetchVideos();
    }, [page]);

    const fetchVideos = async () => {
        setLoading(true);
        try {
            const res = await videoAPI.getVideos(page);
                        setVideos(res.data?.data || []);
                        setTotal(res.data?.pagination?.total || 0);
        } catch (error) {
            console.error('获取视频失败', error);
            message.error('获取视频列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (videoId: number, index: number) => {
        if (!user) {
            message.warning('请先登录');
            return;
        }
        try {
            await videoAPI.likeVideo(videoId);
            const newVideos = [...videos];
            const video = newVideos[index];
            if (video.is_liked) {
                video.like_count--;
                video.is_liked = false;
            } else {
                video.like_count++;
                video.is_liked = true;
            }
            setVideos(newVideos);
        } catch (error) {
            message.error('操作失败');
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <Title level={2}>🎀 塔菲呆萌片段 🎀</Title>
                <Paragraph type="secondary">记录塔菲的每一个可爱瞬间</Paragraph>
            </div>

            {videos.length === 0 ? (
                <Empty description="暂无视频" />
            ) : (
                <>
                    <Row gutter={[24, 24]}>
                        {videos.map((video, index) => (
                            <Col xs={24} sm={12} md={8} key={video.id}>
                                <Card
                                    hoverable
                                    cover={
                                        <Link to={`/videos/${video.id}`}>
                                            <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                                                <img
                                                    alt={video.title}
                                                    src={video.cover_url || 'https://picsum.photos/400/225'}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://picsum.photos/400/225';
                                                    }}
                                                />
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 8,
                                                    right: 8,
                                                    background: 'rgba(0,0,0,0.6)',
                                                    color: 'white',
                                                    padding: '2px 6px',
                                                    borderRadius: 4,
                                                    fontSize: 12
                                                }}>
                                                    {(video.duration_seconds != null ? Math.floor(video.duration_seconds / 60) + ':' + (video.duration_seconds % 60).toString().padStart(2, '0') : '--:--')}
                                                </div>
                                                <PlayCircleOutlined style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    fontSize: 48,
                                                    color: 'white',
                                                    opacity: 0.8
                                                }} />
                                            </div>
                                        </Link>
                                    }
                                    actions={[
                                        <span key="views" onClick={(e) => e.stopPropagation()}>
                                            <EyeOutlined /> {video.view_count}
                                        </span>,
                                        <span 
                                            key="likes" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                handleLike(video.id, index);
                                            }}
                                            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                        >
                                            {video.is_liked ? <HeartFilled style={{ color: '#ff69b4' }} /> : <HeartOutlined />}
                                            <span>{video.like_count}</span>
                                        </span>
                                    ]}
                                >
                                    <Link to={`/videos/${video.id}`}>
                                        <Card.Meta
                                            title={video.title}
                                            description={
                                                <Paragraph ellipsis={{ rows: 2 }} style={{ height: 44, marginBottom: 0 }}>
                                                    {video.description}
                                                </Paragraph>
                                            }
                                        />
                                    </Link>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    {total > 12 && (
                        <div style={{ textAlign: 'center', marginTop: 32 }}>
                            <Pagination
                                current={page}
                                total={total}
                                pageSize={12}
                                onChange={setPage}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}