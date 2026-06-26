import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { 
    HomeOutlined, 
    VideoCameraOutlined, 
    PlusCircleOutlined, 
    UserOutlined,
    LogoutOutlined,
    MessageOutlined
} from '@ant-design/icons';
import { useUserStore } from '../../stores/userStore';
import NotificationBell from '../NotificationBell';

const { Header, Content, Footer } = AntLayout;
const { Title, Text } = Typography;

export default function Layout() {
    const { user, logout } = useUserStore();
    const navigate = useNavigate();

    const menuItems = [
        {
            key: '/',
            label: <Link to="/" style={{ color: 'inherit' }}>🏠 首页</Link>,
            icon: <HomeOutlined />
        },
        {
            key: '/videos',
            label: <Link to="/videos" style={{ color: 'inherit' }}>🎬 呆萌片段</Link>,
            icon: <VideoCameraOutlined />
        },
    ];

    const userMenuItems = [
        { key: 'profile', label: <Link to="/profile">👤 个人中心</Link>, icon: <UserOutlined /> },
        { key: 'create', label: <Link to="/create-post">📝 发布帖子</Link>, icon: <PlusCircleOutlined /> },
        { key: 'messages', label: <Link to="/messages">💬 私信</Link>, icon: <MessageOutlined /> },
        user?.role === 'admin' && { key: 'admin', label: <Link to="/admin">👑 管理面板</Link>, icon: <UserOutlined /> },
        user?.role === 'admin' && { key: 'review', label: <Link to="/admin/review">📝 帖子审核</Link>, icon: <PlusCircleOutlined /> },
        { type: 'divider' as const },
        { key: 'logout', label: '🚪 退出登录', icon: <LogoutOutlined />, onClick: logout },
    ];

    // 粉色渐变导航栏
    const headerStyle: React.CSSProperties = {
        background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 50%, #c2185b 100%)',
        padding: '0 24px',
        position: 'sticky' as const,
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        boxShadow: '0 2px 12px rgba(255,105,180,0.3)',
    };

    const menuStyle: React.CSSProperties = {
        background: 'transparent',
        flex: 1,
        justifyContent: 'center',
        minWidth: 200,
        borderBottom: 'none',
    };

    return (
        <AntLayout style={{ minHeight: '100vh', background: '#fff0f5' }}>
            <Header style={headerStyle}>
                {/* 左侧Logo */}
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexShrink: 0 }}
                    onClick={() => navigate('/')}
                >
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        animation: 'heartBeat 2s ease infinite'
                    }}>
                        🎀
                    </div>
                    <Title level={4} style={{ color: 'white', margin: 0, letterSpacing: 1 }}>
                        永雏塔菲粉丝社区
                    </Title>
                </div>
                
                {/* 中间导航菜单 */}
                <Menu
                    theme="dark"
                    mode="horizontal"
                    items={menuItems}
                    style={menuStyle}
                    onClick={({ key }) => navigate(key)}
                />

                {/* 右侧用户区域 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                    {user ? (
                        <>
                            {/* 通知铃铛 */}
                            <NotificationBell />

                            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                                <Space style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 20 }}>
                                    <Avatar
                                        src={user.avatar_url}
                                        icon={<UserOutlined />}
                                        style={{ border: '2px solid rgba(255,255,255,0.5)' }}
                                    />
                                    <span style={{ color: 'white', fontWeight: 500 }}>{user.username}</span>
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>▼</Text>
                                </Space>
                            </Dropdown>
                        </>
                    ) : (
                        <Space>
                            <Button
                                type="primary"
                                ghost
                                onClick={() => navigate('/login')}
                                style={{
                                    borderColor: 'white',
                                    color: 'white',
                                    borderRadius: 20,
                                    fontWeight: 500,
                                }}
                            >
                                登录
                            </Button>
                            <Button
                                onClick={() => navigate('/register')}
                                style={{
                                    background: 'white',
                                    color: '#ff69b4',
                                    border: 'none',
                                    borderRadius: 20,
                                    fontWeight: 500,
                                }}
                            >
                                注册
                            </Button>
                        </Space>
                    )}
                </div>
            </Header>
            
            <Content style={{ padding: '24px', minHeight: 'calc(100vh - 134px)' }}>
                <div className="fade-in">
                    <Outlet />
                </div>
            </Content>

            <Footer style={{
                textAlign: 'center',
                background: 'linear-gradient(135deg, #fff0f5, #ffe4ec)',
                borderTop: '1px solid #ffe4ec',
                color: '#8c6b7a',
                fontSize: 14,
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <Space direction="vertical" size={8}>
                        <Space size={16}>
                            <span>🎀 用❤️发电</span>
                            <span style={{ color: '#ff69b4' }}>✦</span>
                            <span>塔菲赛高！🐛关于我们：黄毅-2024507110123 钟治政-2024507110121 李浩南-2024507110119 杨建立-2024507110120🐛</span>
                            <span style={{ color: '#ff69b4' }}>✦</span>
                            <span>愿你今天也充满笑容 🌸</span>
                        </Space>
                        <div style={{ opacity: 0.6, fontSize: 12 }}>
                            © 2025 永雏塔菲粉丝社区 | 本站为粉丝自发建设，非官方站点
                        </div>
                    </Space>
                </div>
            </Footer>
        </AntLayout>
    );
}