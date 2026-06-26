import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ConfigProvider 
            locale={zhCN} 
            theme={{
                token: {
                    // 粉色主色调
                    colorPrimary: '#ff69b4',
                    colorInfo: '#ff85c0',
                    colorSuccess: '#52c41a',
                    colorWarning: '#faad14',
                    colorError: '#ff4d4f',
                    // 圆角全面粉化
                    borderRadius: 12,
                    borderRadiusLG: 16,
                    borderRadiusSM: 8,

                    // 背景色
                    colorBgContainer: '#ffffff',
                    colorBgElevated: '#fff0f6',
                    colorBgLayout: '#fff0f5',

                    // 文字色 - 深紫红
                    colorText: '#4a2c3a',
                    colorTextSecondary: '#8c6b7a',
                    colorTextTertiary: '#b08898',
                    // 字体
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
                    // 边框
                    colorBorder: '#ffe4ec',
                    colorBorderSecondary: '#ffd6e0',
                    // 阴影
                    boxShadow: '0 2px 12px rgba(255,105,180,0.1)',
                    boxShadowSecondary: '0 4px 20px rgba(255,105,180,0.15)',
                },
                components: {
                    Card: {
                        paddingLG: 20,
                        borderRadiusLG: 16,
                        colorBorderSecondary: '#ffe4ec',
                    },
                    Button: {
                        borderRadius: 20,
                        controlHeight: 40,
                        primaryShadow: '0 2px 8px rgba(255,105,180,0.3)',
                    },
                    Input: {
                        borderRadius: 12,
                        controlHeight: 44,
                        hoverBorderColor: '#ff69b4',
                        activeBorderColor: '#ff69b4',
                        activeShadow: '0 0 0 2px rgba(255,105,180,0.1)',
                    },
                    Menu: {
                        itemBorderRadius: 20,
                        itemColor: 'rgba(255,255,255,0.85)',
                        itemSelectedColor: '#ffffff',
                        itemHoverColor: '#ffffff',
                        horizontalItemSelectedColor: '#ffffff',
                    },
                    Table: {
                        borderRadius: 12,
                    },
                    Tag: {
                        borderRadius: 10,
                    },
                    Modal: {
                        borderRadiusLG: 16,
                    },
                    Drawer: {
                        borderRadiusLG: 16,
                    },
                    Select: {
                        borderRadius: 12,
                    },
                },
            }}
        >
            <App />
        </ConfigProvider>
    </React.StrictMode>
);