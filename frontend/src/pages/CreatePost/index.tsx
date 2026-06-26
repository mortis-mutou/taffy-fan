import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { postAPI } from '../../api/post';

const { Title } = Typography;
const { TextArea } = Input;

export default function CreatePost() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: { title: string; content: string }) => {
        setLoading(true);
        try {
            await postAPI.createPost(values.title, values.content);
            message.success('发布成功！');
            navigate('/');
        } catch (error: any) {
            message.error(error.response?.data?.error || '发布失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
                返回
            </Button>

            <Card>
                <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
                    发布新帖子
                </Title>
                
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item
                        name="title"
                        label="标题"
                        rules={[
                            { required: true, message: '请输入标题' },
                            { max: 200, message: '标题不能超过200字' }
                        ]}
                    >
                        <Input placeholder="给帖子起一个吸引人的标题" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="内容"
                        rules={[
                            { required: true, message: '请输入内容' },
                            { min: 10, message: '内容至少10个字' }
                        ]}
                    >
                        <TextArea
                            rows={10}
                            placeholder="分享你对塔菲的爱吧..."
                            showCount
                            maxLength={10000}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                            发布帖子
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}