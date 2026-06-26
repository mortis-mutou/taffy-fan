import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Videos from './pages/Videos';
import VideoDetail from './pages/VideoDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ReviewPosts from './pages/Admin/ReviewPosts';
import AdminDashboard from './pages/Admin/Dashboard';
import Messages from './pages/Messages';
import { useUserStore } from './stores/userStore';

function App() {
    const { token, fetchUser } = useUserStore();

    useEffect(() => {
        if (token) {
            fetchUser();
        }
    }, [token, fetchUser]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="post/:id" element={<PostDetail />} />
                    <Route path="create-post" element={
                        token ? <CreatePost /> : <Navigate to="/login" />
                    } />
                    <Route path="videos" element={<Videos />} />
                    <Route path="videos/:id" element={<VideoDetail />} />
                    <Route path="profile" element={
                        token ? <Profile /> : <Navigate to="/login" />
                    } />
                                        <Route path="messages" element={
                        token ? <Messages /> : <Navigate to="/login" />
                    } />
                    <Route path="admin/review" element={token ? <ReviewPosts /> : <Navigate to="/login" />} />
                    <Route path="admin" element={
                        token ? <AdminDashboard /> : <Navigate to="/login" />
                    } />
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;