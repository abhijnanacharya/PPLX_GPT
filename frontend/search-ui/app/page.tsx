import ChatBox from "./components/ChatBox";
import Sidebar from "./components/SideBar";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <ChatBox />
    </div>
  );
}
