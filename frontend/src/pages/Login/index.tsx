import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, HeartOutlined } from '@ant-design/icons';
import { useUserStore } from '../../stores/userStore';
import SliderCaptcha from '../../components/SliderCaptcha';

const { Title, Text } = Typography;

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [resetCaptcha, setResetCaptcha] = useState(false);
    const { login } = useUserStore();
    const navigate = useNavigate();

    const onFinish = async (values: { username: string; password: string }) => {
        if (!captchaToken) {
            message.warning('请先完成人机验证');
            return;
        }
        setLoading(true);
        try {
            await login(values.username, values.password, captchaToken);
            message.success('登录成功！');
            navigate('/');
        } catch (error: any) {
            message.error(error.response?.data?.error || '登录失败');
            setCaptchaToken(null);
            setResetCaptcha(prev => !prev);
        } finally {
            setLoading(false);
        }
    };

    const handleCaptchaVerify = (token: string | null) => {
        setCaptchaToken(token);
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundImage: 'url("https://vip.123pan.cn/1816369016/ai/ta.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)'
            }} />
            
            <Card style={{ width: 400, borderRadius: 16, position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <HeartOutlined style={{ fontSize: 48, color: '#ff69b4' }} />
                    <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>永雏塔菲粉丝社区</Title>
                    <Text type="secondary">登录你的账号</Text>
                </div>

                <Form name="login" onFinish={onFinish} autoComplete="off" size="large">
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入用户名/邮箱' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="用户名 / 邮箱" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                    </Form.Item>

                    {/* 人机验证 */}
                    <Form.Item>
                        <SliderCaptcha 
                            onVerify={handleCaptchaVerify} 
                            reset={resetCaptcha}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            block 
                            loading={loading}
                            style={{ 
                                backgroundColor: '#ff69b4', 
                                borderColor: '#ff69b4',
                                color: 'white'
                            }}
                        >
                            登录
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Link to="/register">还没有账号？立即注册</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
