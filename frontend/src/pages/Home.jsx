import Header from '../components/Header';
import PostList from '../components/PostList';

export default function Home() {
  return (
    <div className="app-wrapper">
      <Header />
      <PostList />
    </div>
  );
}
