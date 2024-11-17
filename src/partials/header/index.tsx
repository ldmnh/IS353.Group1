"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import SearchSuggest from "./search-suggest";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    console.log("User logged out");
    signOut();
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchBar = document.getElementById("search-bar");
      if (
        searchBar &&
        !searchBar.contains(event.target as Node) // Click outside search bar
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>(""); // Lưu trữ giá trị tìm kiếm
  const [suggestions, setSuggestions] = useState<string[]>([]); // Lưu trữ danh sách gợi ý
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true); // Quản lý hiển thị gợi ý

  // Hàm gọi API để lấy khóa học
  const fetchCourses = async (query: string) => {
    try {
      const response = await fetch(`/api/courses/popularity`); // Thay đổi API endpoint tại đây
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      const data = await response.json();
      return data.data
        .map((course: { course_name: string }) => course.course_name) // Chỉ lấy tên khóa học
        .filter((courseName: string) =>
          courseName.toLowerCase().includes(query.toLowerCase())
        );
    } catch (error) {
      console.error("Error fetching courses:", error);
      return [];
    }
  };

  // Hàm tìm kiếm gợi ý
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query); // Cập nhật giá trị tìm kiếm

    if (query.length > 0) {
      // Nếu có giá trị tìm kiếm, gọi API để tìm kiếm gợi ý
      const filteredSuggestions = await fetchCourses(query);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]); // Nếu không có gì nhập, xóa gợi ý
    }
  };

  // Xử lý khi người dùng chọn một gợi ý
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion); // Cập nhật input thành gợi ý đã chọn
    setSuggestions([]); // Ẩn danh sách gợi ý
    setIsSubmitting(false);
    setShowSuggestions(false); // Đóng gợi ý khi chọn
  };

  // Xử lý sự kiện khi người dùng nhấn "Search"
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSubmitting(true);
      // Bạn có thể thực hiện tìm kiếm qua API hoặc chuyển hướng sang trang tìm kiếm
      console.log("Searching for:", searchQuery); // Tìm kiếm với query
      setIsSubmitting(false);
      setSuggestions([]); // Xóa gợi ý sau khi tìm kiếm
      setShowSuggestions(false); // Đóng gợi ý khi tìm kiếm
    }
  };

  // Đóng gợi ý khi người dùng nhấn vào bên ngoài search bar
  const handleClickOutside = (e: MouseEvent) => {
    const searchBar = document.getElementById("search-bar");
    if (searchBar && !searchBar.contains(e.target as Node)) {
      setShowSuggestions(false); // Ẩn gợi ý khi nhấn ra ngoài
    }
  };

  const { data: session, status } = useSession();
  const router = useRouter();

  console.log("Session:", session);
  console.log("Status:", status);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    }
  }, [session, status, router]);

  if (!session) {
    return (
      <header className="relative bg-white pt-[24px] fixed top-0 left-0 right-0 z-[100]">
        <div className="w-4/5 m-auto h-20 flex items-center justify-between px-5">
          {/* Logo */}
          <Link href="/">
            <img src="/imgs/Logo.png" alt="Logo" className="h-16" />
          </Link>

          {/* Search bar */}
          <form
            id="search-bar"
            onSubmit={handleSearch}
            className="relative flex items-center justify-between w-full max-w-[480px] min-w-[700px] border-[#D9D9D9] border-[1.4px] rounded-[18px] px-1 min-h-12  bg-opacity-50">
            <FiSearch className="min-w-[30px] min-h-[30px] p-[7px] rounded-full stroke-[#5271FF]" />
            <input
              type="text"
              placeholder="Find Your Courses..."
              className="w-full border-0 outline-none bg-transparent"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Link href={`/search?keyword=${searchQuery}`}>
              <Button
                type="submit"
                className="bg-[#5271FF] text-white rounded-[18px] py-2 px-8 hover:bg-[#11009E]">
                {isSubmitting ? "Submitting..." : "Search"}
              </Button>
            </Link>
            {/* Hiển thị gợi ý tìm kiếm */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute top-[100%] left-0 w-full bg-white border border-[#D9D9D9] rounded-[12px] max-h-[200px] overflow-y-auto z-50">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="p-2 cursor-pointer hover:bg-[#f0f0f0]"
                    onClick={() => handleSuggestionClick(suggestion)}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </form>
          {/* Khi chưa có account */}
          <div>
            <Link href="/login">
              <Button
                type="submit"
                className="bg-[#5271FF] text-white rounded-[18px] py-2 px-8 hover:bg-[#11009E]">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white pt-[24px] fixed top-0 left-0 right-0 z-[100]">
      <div className="w-4/5 m-auto h-20 flex items-center justify-between px-5">
        {/* Logo */}
        <Link href="/">
          <img src="/imgs/Logo.png" alt="Logo" className="h-16" />
        </Link>

        {/* Search bar */}
        <form
          id="search-bar"
          onSubmit={handleSearch}
          className="relative flex items-center justify-between w-full max-w-[480px] min-w-[700px] border-[#D9D9D9] border-[1.4px] rounded-[18px] px-1 min-h-12  bg-opacity-50">
          <FiSearch className="min-w-[30px] min-h-[30px] p-[7px] rounded-full stroke-[#5271FF]" />
          <input
            type="text"
            placeholder="Find Your Courses..."
            className="w-full border-0 outline-none bg-transparent"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Link href={`/search?keyword=${searchQuery}`}>
            <Button
              type="submit"
              className="bg-[#5271FF] text-white rounded-[18px] py-2 px-8 hover:bg-[#11009E]">
              {isSubmitting ? "Submitting..." : "Search"}
            </Button>
          </Link>
          {/* Hiển thị gợi ý tìm kiếm */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute top-[100%] left-0 w-full bg-white border border-[#D9D9D9] rounded-[12px] max-h-[200px] overflow-y-auto z-50">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="p-2 cursor-pointer hover:bg-[#f0f0f0]"
                  onClick={() => handleSuggestionClick(suggestion)}>
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </form>

        {/* My Courses Button và Avatar */}
        <div className="flex items-center relative">
          <img
            ref={avatarRef}
            src="/imgs/test.jpg"
            alt="Avatar"
            className="h-[40px] w-[40px] rounded-full cursor-pointer"
            onClick={toggleMenu}
          />
          <Link href="/dash-board">
            <Button
              variant="ghost"
              className="cursor-pointer text-[#5271FF] text-base hover:bg-transparent hover:text-[#11009E]">
              Dashboard
            </Button>
          </Link>

          {/* Menu thả xuống */}
          {isMenuOpen && (
            <div
              ref={menuRef}
              className="w-[290px] absolute top-12 right-0 bg-white shadow-2xl rounded-lg p-3 w-auto min-w-max z-50">
              <div className="flex items-center mb-3 gap-2 w-full">
                <img
                  src="/imgs/test.jpg"
                  alt="Avatar"
                  className="h-[60px] w-[60px] rounded-full"
                />
                <div className="pl-[10px] pb-[20px] flex-grow">
                  <p className="font-medium">user user_name</p>
                  <p className="text-sm text-gray-500 break-all">
                    user user_email
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                className="w-full text-left text-white bg-[#5271FF] rounded-[18px] h-[40px] hover:bg-[#11009E] pt-[30px] font-medium py-1">
                Log out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
