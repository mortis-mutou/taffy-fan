import { useEffect, useState } from 'react';
import { Card, Typography } from 'antd';
import { userAPI } from '../api/user';

const { Text } = Typography;

interface Quote {
    text: string;
    author: string;
}

export default function DailyQuote() {
    const [quote, setQuote] = useState<Quote | null>(null);

    useEffect(() => {
        fetchQuote();
    }, []);

    const fetchQuote = async () => {
        try {
            const res = await userAPI.getDailyQuote();
            setQuote(res.data);
        } catch {
            setQuote({
                text: '塔菲今天也很可爱呢~',
                author: '永雏塔菲'
            });
        }
    };

    if (!quote) return null;

    return (
        <Card style={{
            marginBottom: 24,
            background: 'linear-gradient(135deg, #fff0f5, #ffe4ec)',
            border: '1px solid #ffd6e0',
            borderRadius: 16,
            textAlign: 'center',
            padding: '8px 0'
        }}>
            <Text style={{ fontSize: 15, color: '#8c6b7a', fontStyle: 'italic' }}>
                💬 {quote.text}
            </Text>
            <br />
            <Text style={{ fontSize: 12, color: '#b08898' }}>
                —— {quote.author}
            </Text>
        </Card>
    );
}