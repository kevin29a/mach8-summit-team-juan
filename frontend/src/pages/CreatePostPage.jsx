import Header from '../components/Header';
import CreatePost from '../components/CreatePost';

export default function CreatePostPage() {
  return (
    <div className="app-wrapper">
      <Header />
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '20px' }}>
        <CreatePost />
      </div>
    </div>
  );
}
