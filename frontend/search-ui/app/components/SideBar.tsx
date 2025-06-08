export default function Sidebar() {
  return (
    <aside className="w-full md:w-64 bg-gradient-to-b from-indigo-600 to-blue-500 text-white flex flex-col items-center py-8 h-full min-h-screen shadow-lg">
      <div className="mb-8 grid place-items-center">
        <span className="text-6xl font-bold tracking-tight">👾👾👾👾</span>
        <span className="block text-sm font-light mt-1">⚡️ Search</span>
      </div>
      <nav className="flex flex-col gap-4 w-full px-6">
        <a
          href="#"
          className="hover:bg-indigo-700 rounded px-3 py-2 transition"
        >
          Home
        </a>
        <a
          href="#"
          className="hover:bg-indigo-700 rounded px-3 py-2 transition"
        >
          History
        </a>
        <a
          href="#"
          className="hover:bg-indigo-700 rounded px-3 py-2 transition"
        >
          Settings
        </a>
      </nav>
      <div className="mt-auto mb-4 px-6 w-full">
        <div className="text-xs text-indigo-200">
          &copy; Made with ❤️ by{" "}
          <a href="https://www.linkedn.com/in/abhijnanacharya/">
            Abhijnan Acharya
          </a>
        </div>
      </div>
    </aside>
  );
}
