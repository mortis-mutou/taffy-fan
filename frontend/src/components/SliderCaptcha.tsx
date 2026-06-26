import { useState, useCallback, useEffect, useRef } from "react";
import { message, Modal } from "antd";

const W = 300, H = 150, S = 38, T = 6;

interface Props {
    onVerify: (token: string | null) => void;
    reset?: boolean;
}

const TAFEI_BG = "url('https://vip.123pan.cn/1816369016/ai/ta.jpg')";

export default function SliderCaptcha({ onVerify, reset }: Props) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState(0);
    const [drag, setDrag] = useState(false);
    const [done, setDone] = useState(false);
    // 随机生成缺口位置 (只用x, y固定在中门附近更美观)
    const tx = useRef(Math.floor(Math.random() * (W - S - 20) + 10));
    const ty = useRef(Math.floor(H / 2 - S / 2 + (Math.random() * 20 - 10)));
    const sx = useRef(0);

    const resetPuzzle = useCallback(() => {
        tx.current = Math.floor(Math.random() * (W - S - 20) + 10);
        ty.current = Math.floor(H / 2 - S / 2 + (Math.random() * 20 - 10));
        setPos(0);
        setDone(false);
    }, []);

    useEffect(() => {
        if (reset) {
            setDone(false);
            resetPuzzle();
        }
    }, [reset]);

    const handleOpen = () => {
        resetPuzzle();
        setOpen(true);
    };

    const handleCancel = () => {
        setOpen(false);
        setPos(0);
        if (!done) resetPuzzle();
    };

    const onDown = (cx: number) => { if (done) return; setDrag(true); sx.current = cx - pos; };
    const onMove = (cx: number) => { if (!drag || done) return; let n = cx - sx.current; n = Math.max(0, Math.min(n, W - S)); setPos(n); };
    const onUp = () => {
        if (!drag || done) return;
        setDrag(false);
        if (Math.abs(pos - tx.current) <= T) {
            setDone(true);
            message.success("验证通过");
            setTimeout(() => {
                setOpen(false);
                onVerify("verified");
            }, 500);
        } else {
            message.error("验证失败");
            resetPuzzle();
        }
    };

    return (
        <>
            {/* 验证按钮 */}
            <div
                onClick={handleOpen}
                style={{
                    width: "100%",
                    height: 40,
                    borderRadius: 6,
                    border: "1px dashed",
                    borderColor: done ? "#52c41a" : "#d9d9d9",
                    background: done ? "#f6ffed" : "#fafafa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "all 0.3s",
                    fontSize: 14,
                    color: done ? "#52c41a" : "#999"
                }}
                onMouseEnter={(e) => { if (!done) e.currentTarget.style.borderColor = "#ff69b4"; }}
                onMouseLeave={(e) => { if (!done) e.currentTarget.style.borderColor = "#d9d9d9"; }}
            >
                {done ? (
                    <span>✓ 已验证</span>
                ) : (
                    <span>点击进行人机验证</span>
                )}
            </div>

            {/* 弹窗 - 拼图验证 */}
            <Modal
                title="人机验证"
                open={open}
                onCancel={handleCancel}
                footer={null}
                width={360}
                centered
                destroyOnClose
            >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0" }}>
                    {/* 拼图区域 */}
                    <div style={{ position: "relative", width: W, height: H, borderRadius: 8, overflow: "hidden", userSelect: "none", background: TAFEI_BG, backgroundSize: "cover", backgroundPosition: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                        {/* 缺口 - 被挖掉的部分，用深色表示 */}
                        <div style={{
                            position: "absolute",
                            left: tx.current,
                            top: ty.current,
                            width: S,
                            height: S,
                            background: "rgba(0,0,0,0.3)",
                            border: "2px solid rgba(255,255,255,0.6)",
                            borderRadius: 3,
                            boxShadow: "inset 0 0 6px rgba(0,0,0,0.2)",
                            zIndex: 2
                        }} />
                        {/* 轨迹地址条 */}
                        <div style={{
                            position: "absolute",
                            left: 0,
                            top: ty.current,
                            width: pos + S / 2,
                            height: S,
                            background: done ? "rgba(82,196,26,0.5)" : "rgba(255,105,180,0.3)",
                            borderTopLeftRadius: 3,
                            borderBottomLeftRadius: 3,
                            zIndex: 1
                        }} />
                        {/* 滑块 - 刚好覆盖缺口的部分图片 */}
                        <div style={{
                            position: "absolute",
                            left: pos,
                            top: ty.current,
                            width: S,
                            height: S,
                            background: TAFEI_BG,
                            backgroundSize: (W) + "px " + (H) + "px",
                            backgroundPosition: (-pos) + "px " + (-ty.current) + "px",
                            borderRadius: 3,
                            boxShadow: "0 0 0 2px rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.3)",
                            zIndex: 10,
                            transition: drag ? "none" : "all 0.2s"
                        }} />
                        {/* 完成层 */}
                        {done && <div style={{ position: "absolute", inset: 0, background: "rgba(82,196,26,0.15)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}>
                            <span style={{ color: "#fff", fontSize: 32, fontWeight: "bold", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>✓</span>
                        </div>}
                    </div>

                    {/* 滑块轨道 */}
                    <div style={{ position: "relative", width: W, height: 38, marginTop: 12, background: done ? "#f6ffed" : "#f0f0f0", borderRadius: 19, border: "1px solid", borderColor: done ? "#b7eb8f" : "#d9d9d9", cursor: done ? "default" : "pointer" }}
                        onMouseDown={(e) => onDown(e.clientX)}
                        onMouseMove={(e) => onMove(e.clientX)}
                        onMouseUp={onUp}
                        onMouseLeave={onUp}
                        onTouchStart={(e) => onDown(e.touches[0].clientX)}
                        onTouchMove={(e) => onMove(e.touches[0].clientX)}
                        onTouchEnd={onUp}
                    >
                        <div style={{ position: "absolute", left: pos, top: 0, width: S, height: 38, background: done ? "#52c41a" : "linear-gradient(135deg, #ff69b4, #ff1493)", borderRadius: 19, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: "bold", transition: drag ? "none" : "left 0.3s", boxShadow: "0 2px 6px rgba(255,105,180,0.4)" }}>
                            {done ? "✓" : "❤️"}
                        </div>
                        <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", color: "#bbb", fontSize: 13, userSelect: "none" }}>
                            {done ? "" : "拖动滑块完成拼图"}
                        </span>
                    </div>

                    <div style={{ marginTop: 12, fontSize: 12, color: "#999" }}>
                        {done ? "验证成功，即将关闭" : "将滑块拖到缺口处完成拼图"}
                    </div>
                </div>
            </Modal>
        </>
    );
}
